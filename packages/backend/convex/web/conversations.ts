import { ConvexError, v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { internal, components } from "../_generated/api";
import { Agent, listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { paginationOptsValidator } from "convex/server";
import { Id, Doc } from "../_generated/dataModel";

// Mutation to generate an upload URL for file attachments
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Query to get many conversation messages by thread ID with pagination
export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.db
      .query("webConversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Validator for attachments
const attachmentValidator = v.object({
  storageId: v.id("_storage"),
  filename: v.string(),
  mediaType: v.string(),
});

// This query replaces your original getMany for streaming threads.
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    // Keep pagination options for non-streaming history
    paginationOpts: paginationOptsValidator, 
    // This is required for the stream handling logic
    streamArgs: vStreamArgs, 
  },
  handler: async (ctx, args) => {
    // NOTE: Add your authorization check here if needed

    // 1. Fetch the regular non-streaming messages (history)
    const paginated = await listUIMessages(ctx, components.agent, args);

    // 2. Fetch the live streaming deltas (real-time updates)
    const streams = await syncStreams(ctx, components.agent, args);

    // Combine and return the results for the client hook
    return { ...paginated, streams };
  },
});

// Mutation to create a new conversation thread or add to an existing one
export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.optional(v.string()),
    assistantId: v.id("assistants"),
    attachments: v.optional(v.array(attachmentValidator)),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    if (!identity.orgId) {
      throw new ConvexError("User is not part of an organization");
    }
    const organizationId = identity.orgId as string;

    const assistant = await ctx.runQuery(
      internal.web.conversations.getAssistant,
      { assistantId: args.assistantId }
    );

    if (!assistant) {
      throw new ConvexError("Assistant not found");
    }

    const agent = new Agent(components.agent, {
      name: "supportAgent",
      languageModel: openai.chat(assistant.model as any),
      instructions: assistant.prompt,
    });

    let threadId = args.threadId;
    if (!threadId) {
      // Generate a title for the new thread
      const { text: title } = await agent.generateText(
        ctx,
        { userId: identity.subject }, // Provide userId for context
        {
          prompt: `Generate a concise title (5 words or less) for the following user query: "${args.prompt}"`,
        }
      );

      const { threadId: newThreadId } = await agent.createThread(ctx, {
        title: title.replace(/^"|"$/g, ""),
        userId: identity.subject,
      });
      threadId = newThreadId;
    }

    await ctx.runMutation(internal.web.conversations.saveMessage, {
      organizationId,
      userId: identity.subject,
      threadId,
      message: args.prompt,
      role: "user",
      assistantId: args.assistantId,
      attachments: args.attachments,
    });

    // Build content array with text and attachments
    const content: Array<any> = [{ type: "text", text: args.prompt }];

    // Add attachments if present
    if (args.attachments) {
      for (const attachment of args.attachments) {
        const url = await ctx.storage.getUrl(attachment.storageId);
        if (url) {
          if (attachment.mediaType.startsWith("image/")) {
            content.push({
              type: "image",
              image: url,
              mimeType: attachment.mediaType,
            });
          } else {
            content.push({
              type: "file",
              data: url,
              mediaType: attachment.mediaType,
            });
          }
        }
      }
    }

    // --- START STREAMING ---
    // The key change: use streamText and save the deltas to the DB
    await agent.streamText(
      ctx,
      { threadId },
      {
        messages: [
          {
            role: "user",
            content,
          },
        ],
      },
      {
        saveStreamDeltas: true, // Enables asynchronous streaming via database deltas
      }
    );

    return threadId;
  },
});

// Query to get a specific thread by its ID
export const getThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Fetch the specific thread by its ID.
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });

    return thread ?? null;
  },
});

// Query to get assistant details by ID
export const getAssistant = internalQuery({
  args: { assistantId: v.id("assistants") },
  handler: async (ctx, args): Promise<Doc<"assistants"> | null> => {
    return await ctx.db.get(args.assistantId);
  },
});

// Mutation to save a message in a conversation thread
const saveMessageAttachmentValidator = v.object({
  storageId: v.id("_storage"),
  filename: v.string(),
  mediaType: v.string(),
});

// Mutation to save a message in a conversation thread
export const saveMessage = internalMutation({ 
  args: {
    organizationId: v.string(),
    userId: v.string(),
    threadId: v.string(),
    message: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    assistantId: v.id("assistants"),
    attachments: v.optional(v.array(saveMessageAttachmentValidator)),
  },
  handler: async (ctx, args) => {
    const attachmentsWithUrls = args.attachments
      ? await Promise.all(
          args.attachments.map(async (att) => ({
            id: att.storageId,
            name: att.filename,
            type: att.mediaType,
            url: (await ctx.storage.getUrl(att.storageId))!,
          }))
        )
      : undefined;

    await ctx.db.insert("webConversations", {
      organizationId: args.organizationId,
      userId: args.userId,
      threadId: args.threadId,
      message: args.message,
      role: args.role,
      assistantId: args.assistantId,
      attachments: attachmentsWithUrls,
    });
  },
});

//Get Assistant - Admin => Municipality assistant table(custom assistants), assistant table(all private assistants)
// 