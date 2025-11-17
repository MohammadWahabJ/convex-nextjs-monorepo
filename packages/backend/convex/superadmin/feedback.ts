import { v } from "convex/values";
import { action } from "../_generated/server";
import { mutation, query } from "../_generated/server";

// Query to get all feedbacks with complete information
export const getAllFeedbacks = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in-progress"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    feedbackType: v.optional(v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("improvement"),
      v.literal("general")
    )),
  },
  handler: async (ctx, args) => {
    let dbQuery = ctx.db.query("portalFeedback");

    // Apply filters if provided
    if (args.status) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("status"), args.status));
    }
    if (args.priority) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("priority"), args.priority));
    }
    if (args.feedbackType) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("feedbackType"), args.feedbackType));
    }

    // Order by creation time in descending order
    const feedbacks = await dbQuery.order("desc").collect();
    
    // Return complete feedback information including all fields
    return feedbacks.map(feedback => ({
      _id: feedback._id,
      _creationTime: feedback._creationTime,
      customerId: feedback.customerId,
      feedbackType: feedback.feedbackType,
      title: feedback.title,
      description: feedback.description,
      priority: feedback.priority,
      status: feedback.status,
      screenshots: feedback.screenshots,
      assignedTo: feedback.assignedTo,
      resolvedBy: feedback.resolvedBy,
      resolvedAt: feedback.resolvedAt,
      adminResponse: feedback.adminResponse,
    }));
  },
});

// Query to get a single feedback by ID with complete information
export const getFeedbackById = query({
  args: {
    id: v.id("portalFeedback"),
  },
  handler: async (ctx, args) => {
    const feedback = await ctx.db.get(args.id);
    
    if (!feedback) {
      return null;
    }

    // Return complete feedback information including all fields
    return {
      _id: feedback._id,
      _creationTime: feedback._creationTime,
      customerId: feedback.customerId,
      feedbackType: feedback.feedbackType,
      title: feedback.title,
      description: feedback.description,
      priority: feedback.priority,
      status: feedback.status,
      screenshots: feedback.screenshots,
      assignedTo: feedback.assignedTo,
      resolvedBy: feedback.resolvedBy,
      resolvedAt: feedback.resolvedAt,
      adminResponse: feedback.adminResponse,
    };
  },
});

// Mutation to create new portal feedback
export const createSuperadminFeedback = mutation({
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
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    screenshots: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const feedbackId = await ctx.db.insert("portalFeedback", {
      customerId: args.customerId,
      feedbackType: args.feedbackType,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: "open", // Default status for new feedback
      screenshots: args.screenshots,
    });

    return feedbackId;
  },
});

// Mutation to update portal feedback
export const updatePortalFeedback = mutation({
  args: {
    id: v.id("portalFeedback"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in-progress"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    assignedTo: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // If status is being set to resolved, add resolvedAt timestamp
    if (updates.status === "resolved" && updates.resolvedBy) {
      (updates as any).resolvedAt = Date.now();
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    
    return { success: true };
  },

});



