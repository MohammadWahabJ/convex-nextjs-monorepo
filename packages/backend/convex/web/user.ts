import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

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
      // Get the base URL from environment or construct it
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const redirectUrl = `${baseUrl}/accept-invitation`;
      const invitation = await clerk.organizations.createOrganizationInvitation(
        {
          organizationId: args.organizationId,
          emailAddress: args.email,
          role: args.role,
          redirectUrl: redirectUrl,
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

export const updateUserMetadata = action({
  args: {
    userId: v.string(),
    department: v.optional(v.array(v.string())),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: true } | { success: false; error: string }> => {
    try {
      const { userId, department } = args;

      const metadata = {
        department: department,
      };

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: metadata,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating user metadata:", error);
      return {
        success: false,
        error:
          (error as any)?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});

export const getUserMetadata = action({
  args: {
    userId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    { success: true; metadata: any } | { success: false; error: string }
  > => {
    try {
      const user = await clerk.users.getUser(args.userId);
      return { success: true, metadata: user.publicMetadata };
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      return {
        success: false,
        error:
          (error as any)?.errors?.[0]?.longMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
});
