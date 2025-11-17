import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";


export async function checkUserAuthenticated(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  return identity;
}
