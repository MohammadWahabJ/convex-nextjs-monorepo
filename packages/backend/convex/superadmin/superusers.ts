import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Types for better type safety
type ManagementRole = "super_admin" | "moderator";
type ActionResult<T> = { success: true } & T | { success: false; error: string };

// Helper function for error handling
const handleError = (error: unknown, context: string): { success: false; error: string } => {
  console.error(`Error ${context}:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
};



// Action to invite management user with role and country metadata
export const inviteManagementUser = action({
  args: {
    emailAddress: v.string(),
    managementRole: v.union(v.literal("super_admin"), v.literal("moderator")),
    countryCode: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ActionResult<{ invitationId: string; emailAddress: string }>> => {
    try {
      // Validate country code for moderator role
      if (args.managementRole === "moderator" && !args.countryCode) {
        return { success: false, error: "Country code is required for moderator role" };
      }

      // Create invitation with role and country in public metadata
      const invitationParams = {
        emailAddress: args.emailAddress,
        publicMetadata: {
          managementRole: args.managementRole,
          ...(args.countryCode && { countryCode: args.countryCode }),
        },
        notify: true,
        ignoreExisting: false,
        expiresInDays: 7,
        ...(args.redirectUrl && { redirectUrl: args.redirectUrl }),
      };

      const invitation = await clerk.invitations.createInvitation(invitationParams);

      return {
        success: true,
        invitationId: invitation.id,
        emailAddress: invitation.emailAddress,
      };
    } catch (error) {
      return handleError(error, "inviting management user");
    }
  },
});

// Action to assign user metadata (managementRole and countryCode)
export const assignUserMetadata = action({
  args: {
    userId: v.string(),
    managementRole: v.union(v.literal("super_admin"), v.literal("moderator")),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ActionResult<{ userId: string; metadata: Record<string, any> }>> => {
    try {
      const metadata = {
        managementRole: args.managementRole,
        countryCode: args.countryCode || null,
        updatedAt: new Date().toISOString(),
      };

      const user = await clerk.users.updateUser(args.userId, {
        publicMetadata: metadata,
      });

      return {
        success: true,
        userId: user.id,
        metadata: user.publicMetadata,
      };
    } catch (error) {
      return handleError(error, "updating user metadata");
    }
  },
});



// Types for user data
type UserData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  publicMetadata: Record<string, any>;
};

type InvitationData = {
  id: string;
  emailAddress: string;
  status: string | undefined;
  createdAt: number;
  publicMetadata: Record<string, any>;
};

// Helper function to convert Clerk user to plain object
const mapUserToPlainObject = (user: any): UserData => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  emailAddresses: user.emailAddresses.map((email: any) => ({
    emailAddress: email.emailAddress,
    id: email.id,
  })),
  imageUrl: user.imageUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastSignInAt: user.lastSignInAt,
  publicMetadata: user.publicMetadata || {},
});

// Helper function to filter management users
const isManagementUser = (user: any): boolean => {
  const userRole = user.publicMetadata?.managementRole;
  return userRole === "super_admin" || userRole === "moderator";
};

// Action to get all users with management roles
export const getAllManagementUsers = action({
  args: {
    limit: v.optional(v.number()),
    includeInvitations: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<ActionResult<{
    users: UserData[];
    invitations?: InvitationData[];
    total: number;
    breakdown: {
      superAdmins: number;
      moderators: number;
      pendingInvitations: number;
    };
  }>> => {
    try {
      const limit = args.limit || 100;

      // Get all users and filter management users
      const userList = await clerk.users.getUserList({ limit });
      const filteredUsers = userList.data.filter(isManagementUser);
      const users = filteredUsers.map(mapUserToPlainObject);

      // Count users by role
      const superAdmins = users.filter(user => user.publicMetadata?.managementRole === "super_admin").length;
      const moderators = users.filter(user => user.publicMetadata?.managementRole === "moderator").length;

      let invitations: InvitationData[] = [];
      let pendingInvitations = 0;

      // Optionally include invitations
      if (args.includeInvitations) {
        try {
          const invitationList = await clerk.invitations.getInvitationList({
            status: "pending" as any,
          });

          // Filter management invitations
          const managementInvitations = invitationList.data.filter((invitation) => {
            const invitationRole = invitation.publicMetadata?.managementRole;
            const invitationType = invitation.publicMetadata?.invitationType;
            return (
              invitationRole === "super_admin" || 
              invitationRole === "moderator" ||
              invitationType === "management_user"
            );
          });

          invitations = managementInvitations.map((invitation) => ({
            id: invitation.id,
            emailAddress: invitation.emailAddress,
            status: invitation.status,
            createdAt: invitation.createdAt,
            publicMetadata: invitation.publicMetadata || {},
          }));

          pendingInvitations = invitations.length;
        } catch (invError) {
          console.error("Error fetching invitations:", invError);
          // Continue without invitations instead of failing
        }
      }

      const result = {
        success: true as const,
        users,
        total: filteredUsers.length,
        breakdown: {
          superAdmins,
          moderators,
          pendingInvitations,
        },
        ...(args.includeInvitations && { invitations }),
      };

      return result;
    } catch (error) {
      return handleError(error, "fetching management users");
    }
  },
});


// Action to get users with no metadata and no organization memberships
export const getUsersWithAcceptedInvitationsNoOrgs = action({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ActionResult<{
    users: Array<UserData & { acceptedInvitationsCount: number }>;
    invitations: InvitationData[];
    total: number;
  }>> => {
    try {
      const limit = args.limit || 100;
      const userList = await clerk.users.getUserList({ limit });
      const usersWithoutMetadataAndOrgs: Array<UserData & { acceptedInvitationsCount: number }> = [];

      // Process users in parallel for better performance
      const processUserPromises = userList.data.map(async (user) => {
        try {
          // Check if user has no public metadata
          const hasNoPublicMetadata = !user.publicMetadata || 
                                     Object.keys(user.publicMetadata).length === 0;

          if (!hasNoPublicMetadata) return null;

          // Check organization memberships
          const memberships = await clerk.users.getOrganizationMembershipList({
            userId: user.id,
          });

          if (memberships.data.length > 0) return null;

          // Get accepted invitation count
          let invitationCount = 0;
          try {
            const invitations = await clerk.users.getOrganizationInvitationList({
              userId: user.id,
              status: ['accepted'] as any,
            });
            invitationCount = invitations.data.length;
          } catch (invError) {
            console.error(`Error fetching invitations for user ${user.id}:`, invError);
          }

          return {
            ...mapUserToPlainObject(user),
            acceptedInvitationsCount: invitationCount,
          };
        } catch (userError) {
          console.error(`Error processing user ${user.id}:`, userError);
          return null;
        }
      });

      const processedUsers = await Promise.all(processUserPromises);
      usersWithoutMetadataAndOrgs.push(...processedUsers.filter(Boolean) as Array<UserData & { acceptedInvitationsCount: number }>);

      // Get pending invitations without management roles
      let pendingInvitations: InvitationData[] = [];
      try {
        const invitationList = await clerk.invitations.getInvitationList({
          status: "pending" as any,
        });

        pendingInvitations = invitationList.data
          .filter((invitation) => !invitation.publicMetadata?.managementRole)
          .map((invitation) => ({
            id: invitation.id,
            emailAddress: invitation.emailAddress,
            status: invitation.status,
            createdAt: invitation.createdAt,
            publicMetadata: invitation.publicMetadata || {},
          }));
      } catch (invError) {
        console.error("Error fetching pending invitations:", invError);
      }

      return {
        success: true,
        users: usersWithoutMetadataAndOrgs,
        invitations: pendingInvitations,
        total: usersWithoutMetadataAndOrgs.length + pendingInvitations.length,
      };
    } catch (error) {
      return handleError(error, "fetching users with no metadata and organizations");
    }
  },
});