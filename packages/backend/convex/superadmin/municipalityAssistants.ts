import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";


// Get all assistants assigned to a specific municipality
export const getAssistantsByMunicipality = query({
  args: {
    municipalityId: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("municipalityAssistants"),
    _creationTime: v.number(),
    municipalityId: v.string(),
    assistantId: v.id("assistants"),
    assistant: v.object({
      _id: v.id("assistants"),
      _creationTime: v.number(),
      organizationId: v.optional(v.string()),
      name: v.string(),
      prompt: v.string(),
      model: v.string(),
      baseSystemPrompt: v.optional(v.string()),
      type: v.union(v.literal("public"), v.literal("private"), v.literal("custom")),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
      maxSteps: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
      color: v.optional(v.string()),
      vectorStoreId: v.string(),
      description: v.optional(v.object({})),
      starterPrompt: v.optional(v.array(v.string())),
      settings: v.optional(
        v.object({
          enableToolUse: v.optional(v.boolean()),
          allowedTools: v.optional(v.array(v.string())),
          maxHistoryMessages: v.optional(v.number()),
        })
      ),
    }),
  })),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const assignments = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_municipality_id", (q) => q.eq("municipalityId", args.municipalityId))
      .collect();

    const assignmentsWithAssistants = [];
    for (const assignment of assignments) {
      const assistant = await ctx.db.get(assignment.assistantId);
      if (assistant) {
        assignmentsWithAssistants.push({
          _id: assignment._id,
          _creationTime: assignment._creationTime,
          municipalityId: assignment.municipalityId,
          assistantId: assignment.assistantId,
          assistant,
        });
      }
    }

    return assignmentsWithAssistants;
  },
});

// Get all municipalities that have a specific assistant assigned
// export const getMunicipalitiesByAssistant = query({
//   args: {
//     assistantId: v.id("assistants"),
//   },
//   returns: v.array(v.object({
//     _id: v.id("municipalityAssistants"),
//     _creationTime: v.number(),
//     municipalityId: v.id("municipalities"),
//     assistantId: v.id("assistants"),
//     municipality: v.object({
//       _id: v.id("municipalities"),
//       _creationTime: v.number(),
//       municipalityNumber: v.number(),
//       municipalityName: v.string(),
//       municipalityAddress: v.string(),
//       municipalityCity: v.string(),
//       municipalityZip: v.string(),
//       municipalityEmail: v.string(),
//       municipalityPhone: v.optional(v.string()),
//     }),
//   })),
//   handler: async (ctx, args) => {
//     await checkUserAuthenticated(ctx);
    
//     const assignments = await ctx.db
//       .query("municipalityAssistants")
//       .withIndex("by_assistant_id", (q) => q.eq("assistantId", args.assistantId))
//       .collect();

//     const assignmentsWithMunicipalities = [];
//     for (const assignment of assignments) {
//       const municipality = await ctx.db.get(assignment.municipalityId);
//       if (municipality) {
//         assignmentsWithMunicipalities.push({
//           _id: assignment._id,
//           _creationTime: assignment._creationTime,
//           municipalityId: assignment.municipalityId,
//           assistantId: assignment.assistantId,
//           municipality,
//         });
//       }
//     }

//     return assignmentsWithMunicipalities;
//   },
// });

// Assign an assistant to a municipality
export const assignAssistantToMunicipality = mutation({
  args: {
    municipalityId: v.string(),
    assistantId: v.id("assistants"),
  },
  returns: v.id("municipalityAssistants"),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    // Check if assignment already exists
    const existingAssignment = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_municipality_id", (q) => q.eq("municipalityId", args.municipalityId))
      .filter((q) => q.eq(q.field("assistantId"), args.assistantId))
      .unique();
    
    if (existingAssignment) {
      throw new Error("Assistant is already assigned to this municipality");
    }
    
    // Verify municipality exists
    // const municipality = await ctx.db.get(args.municipalityId);
    // if (!municipality) {
    //   throw new Error("Municipality not found");
    // }
    
    // Verify assistant exists
    const assistant = await ctx.db.get(args.assistantId);
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    
    const assignmentId = await ctx.db.insert("municipalityAssistants", {
      municipalityId: args.municipalityId,
      assistantId: args.assistantId,
    });
    
    return assignmentId;
  },
});

// Remove an assistant from a municipality
export const removeAssistantFromMunicipality = mutation({
  args: {
    municipalityId: v.string(),
    assistantId: v.id("assistants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const assignment = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_municipality_id", (q) => q.eq("municipalityId", args.municipalityId))
      .filter((q) => q.eq(q.field("assistantId"), args.assistantId))
      .unique();
    
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    
    await ctx.db.delete(assignment._id);
    return null;
  },
});

// Remove assignment by assignment ID
export const removeAssignment = mutation({
  args: {
    assignmentId: v.id("municipalityAssistants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    await ctx.db.delete(args.assignmentId);
    return null;
  },
});
