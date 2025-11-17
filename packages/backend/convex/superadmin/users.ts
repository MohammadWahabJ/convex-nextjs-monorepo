import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { ConvexError } from "convex/values";

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

interface OrganizationInfo {
  id: string;
  name: string;
  slug: string | null;
  imageUrl: string;
}

interface UserInfo {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  identifier: string;
  imageUrl: string;
}

interface User {
  id: string;
  role: string;
  permissions: string[];
  createdAt: number;
  updatedAt: number;
  organization: OrganizationInfo | null;
  user: UserInfo | null;
}

// Action to fetch users list by organization id
export const getUsersByOrganization = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { success: true; users: User[]; total: number }
    | { success: false; error: string }
  > => {
    try {
      const membershipList =
        await clerk.organizations.getOrganizationMembershipList({
          organizationId: args.organizationId,
        });

      // Convert Clerk objects to plain JSON
      const users = membershipList.data.map((member) => ({
        id: member.id,
        role: member.role,
        permissions: member.permissions,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        // Flatten organization info
        organization: member.organization
          ? {
              id: member.organization.id,
              name: member.organization.name,
              slug: member.organization.slug,
              imageUrl: member.organization.imageUrl,
            }
          : null,
        // Flatten user info
        user: member.publicUserData
          ? {
              userId: member.publicUserData.userId,
              firstName: member.publicUserData.firstName,
              lastName: member.publicUserData.lastName,
              identifier: member.publicUserData.identifier,
              imageUrl: member.publicUserData.imageUrl,
            }
          : null,
      }));

      return {
        success: true,
        users,
        total: membershipList.totalCount,
      };
    } catch (error) {
      console.error("Error fetching users from Clerk:", error);
      return {
        success: false,
        error:
          (error as { errors?: any[] })?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});

// ...existing code...
export const inviteUserToOrganization = action({
  args: {
    organizationId: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    invitation?: {
      id: string;
      emailAddress: string;
      role: string;
      organizationId: string;
      status: string | undefined;
      url: string | null;
      createdAt: number;
      expiresAt: number | null;
    };
    error?: string;
  }> => {
    try {
      const invitation = await clerk.organizations.createOrganizationInvitation(
        {
          organizationId: args.organizationId,
          emailAddress: args.email,
          role: args.role,
        }
      );

      // ✅ Convert to plain JSON before returning
      return {
        success: true,
        invitation: {
          id: invitation.id,
          emailAddress: invitation.emailAddress,
          role: invitation.role,
          organizationId: invitation.organizationId,
          status: invitation.status,
          url: invitation.url,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
        },
      };
    } catch (error) {
      console.error("Error inviting user to Clerk organization:", error);
      return {
        success: false,
        error:
          (error as any)?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});
// ...existing code...

// Action to fetch invited users list by organization id
interface InvitedUser {
  id: string;
  emailAddress: string;
  role: string;
  organizationId: string;
  status: string | undefined;
  url: string | null;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
}

export const getInvitedUsersByOrganization = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { success: true; invitedUsers: InvitedUser[]; totalCount: number }
    | { success: false; error: string }
  > => {
    try {
      const invitationList =
        await clerk.organizations.getOrganizationInvitationList({
          organizationId: args.organizationId,
        });

      // Convert Clerk invitation objects to plain JSON
      const invitedUsers = invitationList.data.map((invitation) => ({
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        role: invitation.role,
        organizationId: invitation.organizationId,
        status: invitation.status,
        url: invitation.url,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        expiresAt: invitation.expiresAt,
      }));

      return {
        success: true,
        invitedUsers,
        totalCount: invitationList.totalCount,
      };
    } catch (error) {
      console.error("Error fetching invited users from Clerk:", error);
      return {
        success: false,
        error:
          (error as { errors?: any[] })?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});

export const inviteSuperadmin = action({
  args: {
    emailAddress: v.string(),
    redirectUrl: v.optional(v.string()),
    publicMetadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { success: true; invitationId: string; emailAddress: string }
    | { success: false; error: string }
  > => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (identity === null) {
    //   throw new ConvexError({
    //     code: "UNAUTHORIZED",
    //     message: "Identity not found",
    //   });
    // }

    try {
      const invitation = await clerk.invitations.createInvitation({
        emailAddress: args.emailAddress,
        redirectUrl: args.redirectUrl,
        publicMetadata: args.publicMetadata,
      });

      return {
        success: true,
        invitationId: invitation.id,
        emailAddress: invitation.emailAddress,
      };
    } catch (error) {
      console.error("Error inviting superadmin:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});


export const getUsersCount = action({
  args: {},
  handler: async () => {
    try {
      const userList = await clerk.users.getCount();

      return {
        success: true,
        count: userList,
      };
    } catch (error) {
      console.error("Error fetching users count from Clerk:", error);
      return {
        success: false,
        error:
          (error as { errors?: any[] })?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});
