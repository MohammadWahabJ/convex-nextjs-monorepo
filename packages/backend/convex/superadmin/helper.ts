import { v } from "convex/values";
import { action, mutation, internalMutation } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { ConvexError } from "convex/values";
import { internal, api } from "../_generated/api";

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

 
// Action to get user identity and metadata using Clerk client
export const getUserIdentityAndMetadata = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await clerkClient.users.getUser(args.userId);
    const publicMetadata = user.publicMetadata as any;
    
    return {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || null,
      managementRole: publicMetadata?.managementRole || null,
      countryCode: publicMetadata?.countryCode || null,
    };
  },
});