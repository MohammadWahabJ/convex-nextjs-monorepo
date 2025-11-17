import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";


export const create = action({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    // This refreshes the user's session if they are within the threshold
    await ctx.runMutation(internal.system.contactSessions.refresh, {
      contactSessionId: args.contactSessionId,
    });

    // Get the conversation
    const conversation = await ctx.runQuery(
      internal.system.conversations.getOne,
      {
        conversationId: args.conversationId,
      },
    );

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    let threadId = conversation.threadId;

    // If no thread exists, create one
    if (!threadId) {
      const { threadId: newThreadId } = await supportAgent.createThread(ctx, {
        userId: conversation.organizationId,
      });
      
      threadId = newThreadId;

      // Update the conversation with the new threadId
      await ctx.runMutation(internal.system.conversations.updateThreadId, {
        conversationId: args.conversationId,
        threadId,
      });
    }

    // Generate AI response with the user's prompt
    await supportAgent.generateText(
      ctx,
      { threadId },
      {
        prompt: args.prompt,
        // tools: {
        //   escalateConversationTool: escalateConversation,
        //   resolveConversationTool: resolveConversation,
        //   searchTool: search,
        // }
      },
    );
  },
});

export const getMany = query({
  args: {
    threadId: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    if (!args.threadId) {
      // Return empty result if no thread exists yet
      return {
        page: [],
        isDone: true,
        continueCursor: null,
      };
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    return paginated;
  },
});
