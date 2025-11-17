import { ConvexError } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Query to get all assistants for the authenticated user's organization
export const getAssistants = query({
  args: {},
  handler: async (ctx): Promise<Doc<"assistants">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    if (!identity.orgId) {
      throw new ConvexError("User is not part of an organization");
    }
    const organizationId = identity.orgId as string;

    const role = identity.role;

    if (role === "org:member") {
      const department = (identity.public_metadata as any)?.department as
        | Id<"assistants">[]
        | undefined;

      const assignedAssistants = department
        ? (await Promise.all(department.map((id) => ctx.db.get(id)))).filter(
            (assistant): assistant is Doc<"assistants"> =>
              assistant !== null && assistant.organizationId === organizationId
          )
        : [];

      // Combine and deduplicate assistants
      const allAssistants = [...assignedAssistants];
      const uniqueAssistants = Array.from(
        new Map(
          allAssistants.map((assistant) => [assistant._id, assistant])
        ).values()
      );

      return uniqueAssistants;
    } else {
      // Existing logic for non-member roles
      // Get assistants from municipalityAssistants table
      const municipalityAssistantsRelations = await ctx.db
        .query("municipalityAssistants")
        .withIndex("by_municipality_id", (q) =>
          q.eq("municipalityId", organizationId)
        )
        .collect();

      const municipalityAssistantIds = municipalityAssistantsRelations.map(
        (relation) => relation.assistantId
      );

      const municipalityAssistants = (
        await Promise.all(municipalityAssistantIds.map((id) => ctx.db.get(id)))
      ).filter(
        (assistant): assistant is Doc<"assistants"> => assistant !== null
      );

      // Get private assistants for the organization
      const privateAssistants = await ctx.db
        .query("assistants")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .filter((q) => q.eq(q.field("type"), "private"))
        .collect();

      // Combine and deduplicate assistants
      const allAssistants = [...municipalityAssistants, ...privateAssistants];
      const uniqueAssistants = Array.from(
        new Map(
          allAssistants.map((assistant) => [assistant._id, assistant])
        ).values()
      );

      return uniqueAssistants;
    }
  },
});
