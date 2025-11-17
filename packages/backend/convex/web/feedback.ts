import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";

// Mutation to submit feedback
export const submitFeedback = mutation({
  args: {
    customerId: v.string(),
    feedbackType: v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("improvement"),
      v.literal("general")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    screenshots: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Optionally, check user authentication here
    // await checkUserAuthenticated(ctx);
    const id = await ctx.db.insert("portalFeedback", {
      customerId: args.customerId,
      feedbackType: args.feedbackType,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: "open",
      screenshots: args.screenshots,
    });
    return id;
  },
});

// Query to get feedbacks submitted by a user
export const getUserFeedbackByID = query({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portalFeedback")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});
