import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";

// Get notifications for an organization with role-based filtering
export const getNotificationsByOrganization = query({
  args: {},
  handler: async (ctx, args) => {
    // Check user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    
    // Get user's organizational role from session claims
    // Try different ways to access org role and ID
    const orgRole = identity.role || identity.orgRole || identity.org_role || 
                   (identity.publicMetadata as any)?.orgRole ||
                   (identity.organizationMemberships as any)?.[0]?.role;
    const orgId = identity.orgId || identity.org_id || 
                 (identity.publicMetadata as any)?.orgId ||
                 (identity.organizationMemberships as any)?.[0]?.organization?.id;
    
    
    // Verify user has organization access
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `User does not belong to any organization. Available keys: ${Object.keys(identity).join(', ')}`,
      });
    }
    
    if (!orgRole || typeof orgRole !== "string") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `User role not found. Available keys: ${Object.keys(identity).join(', ')}, role value: ${JSON.stringify(identity.role)}, orgRole value: ${JSON.stringify(orgRole)}`,
      });
    }

    // Normalize the role format - Clerk might use "admin"/"member" instead of "org:admin"/"org:member"
    const normalizedRole = orgRole.startsWith("org:") ? orgRole : `org:${orgRole}`;
    
    
    let organizationAssignments;

    if (normalizedRole === "org:admin") {
      // Admins get all notifications for the organization
      organizationAssignments = await ctx.db
        .query("organizationNotifications")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
        .collect();
    } else if (normalizedRole === "org:member") {
      // Members only get notifications assigned to their role or with no specific role
      organizationAssignments = await ctx.db
        .query("organizationNotifications")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
        .filter((q) => 
          q.or(
            q.eq(q.field("role"), "org:member"),
            q.eq(q.field("role"), undefined)
          )
        )
        .collect();
    } else {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `Invalid user role: ${normalizedRole}. Expected org:admin or org:member`,
      });
    }

    // Get the actual notification details for each assignment
    const notifications = await Promise.all(
      organizationAssignments.map(async (assignment) => {
        const notification = await ctx.db.get(assignment.notificationId);
        if (!notification) {
          return null;
        }

        return {
          ...notification,
          assignmentId: assignment._id,
          assignedRole: assignment.role,
          assignedAt: assignment.createdAt,
        };
      })
    );

    // Filter out any null results and sort by creation time (newest first)
    return notifications
      .filter((notification) => notification !== null)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get unread notification count for an organization
export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx, args) => {
    // Check user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    // Get user's organizational role from session claims
    // Try different ways to access org role and ID
    const orgRole = identity.role || identity.orgRole || identity.org_role || 
                   (identity.publicMetadata as any)?.orgRole ||
                   (identity.organizationMemberships as any)?.[0]?.role;
    const orgId = identity.orgId || identity.org_id || 
                 (identity.publicMetadata as any)?.orgId ||
                 (identity.organizationMemberships as any)?.[0]?.organization?.id;
    
    // Verify user has organization access
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `User does not belong to any organization. Available keys: ${Object.keys(identity).join(', ')}`,
      });
    }
    
    if (!orgRole || typeof orgRole !== "string") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `User role not found. Available keys: ${Object.keys(identity).join(', ')}, role value: ${JSON.stringify(identity.role)}, orgRole value: ${JSON.stringify(orgRole)}`,
      });
    }

    // Normalize the role format - Clerk might use "admin"/"member" instead of "org:admin"/"org:member"
    const normalizedRole = orgRole.startsWith("org:") ? orgRole : `org:${orgRole}`;

    let organizationAssignments;

    if (normalizedRole === "org:admin") {
      // Admins get all notifications for the organization
      organizationAssignments = await ctx.db
        .query("organizationNotifications")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
        .collect();
    } else if (normalizedRole === "org:member") {
      // Members only get notifications assigned to their role or with no specific role
      organizationAssignments = await ctx.db
        .query("organizationNotifications")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
        .filter((q) => 
          q.or(
            q.eq(q.field("role"), "org:member"),
            q.eq(q.field("role"), undefined)
          )
        )
        .collect();
    } else {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `Invalid user role: ${normalizedRole}. Expected org:admin or org:member`,
      });
    }

    return organizationAssignments.length;
  },
});
