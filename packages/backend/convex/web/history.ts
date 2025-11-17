import { ConvexError, v } from "convex/values";
import { action, internalAction, mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export const listThreadsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new ConvexError("Not authenticated");
    }

    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      {
        userId: args.userId,
      },
    );

    const threadsWithAssistant = await Promise.all(
      threads.page.map(async (thread) => {
        const messageHistory = await ctx.runQuery(
          components.agent.messages.listMessagesByThreadId,
          {
            threadId: thread._id,
            order: "asc",
            paginationOpts: { numItems: 5, cursor: null },
          },
        );

        const assistantMessage = messageHistory.page.find(
          (msg) => msg.message?.role === "assistant",
        );

        const assistantName = assistantMessage?.agentName ?? "Unknown";

        return {
          ...thread,
          assistantName,
        };
      }),
    );

    return threadsWithAssistant;
  },
});

export const getMessagesByThreadId = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // First check if user owns this thread
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });
    if (thread?.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }

    // Fetch all messages for the thread
    const messages = await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      {
        threadId: args.threadId,
        order: "asc",
        paginationOpts: { numItems: 1000, cursor: null }, // Fetch up to 1000 messages
      },
    );

    return messages.page;
  },
});

export const deleteThread = action({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // First check if user owns this thread
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });
    if (thread?.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }

    // Delete the thread
    await ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync, {
      threadId: args.threadId,
    });
  },
});


// export const getThread = query({
//   args: { threadId: v.id("threads") },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new ConvexError("Not authenticated");
//     }

//     const thread = await ctx.runQuery(components.agent.threads.getThread, {
//       threadId: args.threadId,
//     });

//     // Ensure user owns this thread
//     if (thread?.userId !== identity.subject) {
//       throw new ConvexError("Not authorized");
//     }

//     return thread;
//   },
// });

export const updateThreadTitle = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // First check if user owns this thread
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (thread?.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }

    // Update the thread title
    await ctx.runMutation(components.agent.threads.updateThread, {
      threadId: args.threadId,
      patch: { title: args.title },
    });
  },
});

// export const createThread = mutation({
//   args: {
//     title: v.string(),
//     summary: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new ConvexError("Not authenticated");
//     }

//     const thread = await ctx.runMutation(components.agent.threads.createThread, {
//       title: args.title,
//       summary: args.summary,
//       userId: identity.subject,
//     });

//     return thread;
//   },
// });

// export const archiveThread = mutation({
//   args: { 
//     threadId: v.id("threads"),
//     archived: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new ConvexError("Not authenticated");
//     }

//     // First check if user owns this thread
//     const thread = await ctx.runQuery(components.agent.threads.getThread, {
//       threadId: args.threadId,
//     });

//     if (thread?.userId !== identity.subject) {
//       throw new ConvexError("Not authorized");
//     }

//     await ctx.runMutation(components.agent.threads.updateThread, {
//       threadId: args.threadId,
//       patch: { status: args.archived ? "archived" : "active" },
//     });
//   },
// });
