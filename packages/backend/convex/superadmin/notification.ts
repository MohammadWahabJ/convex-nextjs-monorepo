import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";

// Create a notification
export const createNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("update"),
      v.literal("info"),
      v.literal("error"),
      v.literal("alert")
    ),
    actionUrl: v.optional(v.string()),
    countryCode: v.string(),
    createdBy: v.optional(v.string()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission to create notifications (super admin only)
    
    const notificationId = await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      countryCode: args.countryCode,
      type: args.type,
      actionUrl: args.actionUrl,
      createdBy: args.createdBy,
    });
    
    return notificationId;
  },
});

// Get all notifications (for super admin)
export const getAllNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user is super admin
    
    const limit = args.limit || 50;
    const notifications = await ctx.db
      .query("notifications")
      .order("desc")
      .take(limit);
    
    return notifications;
  },
});

// Get all notifications with organization assignments (for filtering)
export const getAllNotificationsWithOrganizations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user is super admin
    
    const limit = args.limit || 50;
    const notifications = await ctx.db
      .query("notifications")
      .order("desc")
      .take(limit);
    
    // For each notification, get its organization assignments
    const notificationsWithOrgs = await Promise.all(
      notifications.map(async (notification) => {
        const assignments = await ctx.db
          .query("organizationNotifications")
          .withIndex("by_notificationId", q => q.eq("notificationId", notification._id))
          .collect();
        
        return {
          ...notification,
          createdAt: notification._creationTime, // Add createdAt for type compatibility
          organization_assignments: assignments,
        };
      })
    );
    
    return notificationsWithOrgs;
  },
});

// Get notification by ID
export const getNotificationById = query({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }
    
    return notification;
  },
});

// Assign notification to organization
export const assignNotificationToOrganization = mutation({
  args: {
    notificationId: v.id("notifications"),
    organizationId: v.string(),
    role: v.optional(v.string()),
  },
  returns: v.id("organizationNotifications"),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    // Check if notification exists
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }
    
    // Check if assignment already exists
    const existingAssignment = await ctx.db
      .query("organizationNotifications")
      .withIndex("by_notificationId", q => q.eq("notificationId", args.notificationId))
      .filter(q => q.eq(q.field("organizationId"), args.organizationId))
      .first();
    
    if (existingAssignment) {
      throw new ConvexError("Notification is already assigned to this organization");
    }
    
    // Create new assignment
    const assignmentId = await ctx.db.insert("organizationNotifications", {
      notificationId: args.notificationId,
      organizationId: args.organizationId,
      role: args.role,
      createdAt: Date.now(),
    });
    
    return assignmentId;
  },
});

// Assign notification to multiple organizations
export const assignNotificationToMultipleOrganizations = mutation({
  args: {
    notificationId: v.id("notifications"),
    organizationIds: v.array(v.string()),
    role: v.optional(v.string()),
  },
  returns: v.array(v.id("organizationNotifications")),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    // Check if notification exists
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }
    
    const assignmentIds = [];
    
    // Create assignments for each organization
    for (const orgId of args.organizationIds) {
      // Check if assignment already exists
      const existingAssignment = await ctx.db
        .query("organizationNotifications")
        .withIndex("by_notificationId", q => q.eq("notificationId", args.notificationId))
        .filter(q => q.eq(q.field("organizationId"), orgId))
        .first();
      
      if (!existingAssignment) {
        const assignmentId = await ctx.db.insert("organizationNotifications", {
          notificationId: args.notificationId,
          organizationId: orgId,
          role: args.role,
          createdAt: Date.now(),
        });
        assignmentIds.push(assignmentId);
      }
    }
    
    return assignmentIds;
  },
});

// Get notifications for a specific organization
export const getNotificationsForOrganization = query({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has access to this organization
    
    const limit = args.limit || 20;
    
    // Get notification assignments for this organization
    const assignments = await ctx.db
      .query("organizationNotifications")
      .withIndex("by_organizationId", q => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);
    
    // Get the actual notification data for each assignment
    const notifications = await Promise.all(
      assignments.map(async (assignment) => {
        const notification = await ctx.db.get(assignment.notificationId);
        return notification ? {
          ...notification,
          assignment_createdAt: assignment.createdAt,
          assignment_id: assignment._id,
        } : null;
      })
    );
    
    // Filter out any null results (in case a notification was deleted)
    return notifications.filter(notification => notification !== null);
  },
});

// Remove notification assignment from organization
export const removeNotificationFromOrganization = mutation({
  args: {
    notificationId: v.id("notifications"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    // Find the assignment to delete
    const assignment = await ctx.db
      .query("organizationNotifications")
      .withIndex("by_notificationId", q => q.eq("notificationId", args.notificationId))
      .filter(q => q.eq(q.field("organizationId"), args.organizationId))
      .first();
    
    if (!assignment) {
      throw new ConvexError("Assignment not found");
    }
    
    // Delete the assignment
    await ctx.db.delete(assignment._id);
  },
});

// Get all organizations assigned to a notification
export const getOrganizationsForNotification = query({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    // Get all assignments for this notification
    const assignments = await ctx.db
      .query("organizationNotifications")
      .withIndex("by_notificationId", q => q.eq("notificationId", args.notificationId))
      .collect();
    
    return assignments.map(assignment => ({
      organizationId: assignment.organizationId,
      assigned_at: assignment.createdAt,
      assignment_id: assignment._id,
    }));
  },
});

// Update a notification
export const updateNotification = mutation({
  args: {
    id: v.id("notifications"),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("update"),
      v.literal("info"),
      v.literal("error"),
      v.literal("alert")
    )),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }
    
    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.message !== undefined) updates.message = args.message;
    if (args.type !== undefined) updates.type = args.type;
    if (args.actionUrl !== undefined) updates.actionUrl = args.actionUrl;
    
    await ctx.db.patch(args.id, updates);
  },
});

// Delete a notification (and all its assignments)
export const deleteNotification = mutation({
  args: {
    id: v.id("notifications"),
  },
  returns: v.object({
    deletedNotification: v.boolean(),
    deletedAssignments: v.number(),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }
    
    // Remove all organization assignments for this notification
    const assignments = await ctx.db
      .query("organizationNotifications")
      .withIndex("by_notificationId", q => q.eq("notificationId", args.id))
      .collect();
    
    let deletedAssignments = 0;
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
      deletedAssignments++;
    }
    
    // Delete the notification
    await ctx.db.delete(args.id);
    
    return {
      deletedNotification: true,
      deletedAssignments,
    };
  },
});

// Get notification statistics
export const getNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission (super admin)
    
    // Count total notifications
    const allNotifications = await ctx.db.query("notifications").collect();
    const totalNotifications = allNotifications.length;
    
    // Count by type
    const typeStats = allNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count total assignments
    const allAssignments = await ctx.db.query("organizationNotifications").collect();
    const totalAssignments = allAssignments.length;
    
    // Count unique organizations with notifications
    const uniqueOrganizations = new Set(allAssignments.map(a => a.organizationId)).size;
    
    return {
      totalNotifications,
      totalAssignments,
      uniqueOrganizations,
      typeStats,
    };
  },
});
