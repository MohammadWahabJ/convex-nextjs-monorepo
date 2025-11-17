import { v, ConvexError } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";

// Create an assistant
export const createAssistant = mutation({
  args: {
    organizationId: v.optional(v.string()),
    name: v.string(),
    prompt: v.string(),
    baseSystemPrompt: v.optional(v.string()),
    starterPrompt: v.optional(v.array(v.string())),
    type: v.union(v.literal("public"), v.literal("private"), v.literal("custom")),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    maxSteps: v.optional(v.number()),
    isActive: v.boolean(),
    color: v.optional(v.string()),
    model: v.string(),
    vectorStoreId: v.string(),
    countryCode: v.optional(v.string()),
    createdBy: v.optional(v.string()), // Required user ID field
    settings: v.optional(
      v.object({
        enableToolUse: v.optional(v.boolean()),
        allowedTools: v.optional(v.array(v.string())),
        maxHistoryMessages: v.optional(v.number()),
      })
    ),
  },
  returns: v.id("assistants"),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Verify user has permission to create assistant for this municipality
    
    // Get createdBy from args or from authenticated user
    let createdBy = args.createdBy;
    if (!createdBy) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity === null) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "Identity not found",
        });
      }
      createdBy = identity.subject;
    }
    
    const assistantId = await ctx.db.insert("assistants", {
      organizationId: args.organizationId,
      name: args.name,
      prompt: args.prompt,
      description: {}, // Default to empty object as per schema
      baseSystemPrompt: args.baseSystemPrompt,
      starterPrompt: args.starterPrompt,
      type: args.type,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      maxSteps: args.maxSteps,
      isActive: args.isActive,
      countryCode: args.countryCode,
      color: args.color,
      model: args.model,
      vectorStoreId: args.vectorStoreId,
      createdBy: createdBy, // Use the determined createdBy value
      settings: args.settings,
    });
    return assistantId;
  },
});

// Get all assistants of a municipality (max 20)
export const getAllAssistants = query({
  args: {
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    // TODO: Filter by user's municipality(s)
    const assistants = await ctx.db.query("assistants").take(50);
    return assistants;
  },
});

// Query for role-based assistant filtering
export const getAllAssistantsWithRole = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    try {
      const managementRole = identity.managementRole;
      const userCountryCode = identity.countryCode;

      // Get all assistants from database
      let assistants = await ctx.db.query("assistants").collect();
      
      // Filter by active status (default to true)
      const { activeOnly = true } = args;
      if (activeOnly !== undefined) {
        assistants = assistants.filter((assistant) => assistant.isActive === activeOnly);
      }

      // Apply role-based filtering
      if (managementRole === "moderator" && userCountryCode) {
        // Moderator: only show assistants matching their countryCode
        assistants = assistants.filter((assistant) => assistant.countryCode === userCountryCode);
      }
      // Super admin: show all assistants (no additional filtering needed)

      return assistants;
    } catch (error) {
      console.error("Error fetching assistants:", error);
      return [];
    }
  },
});

// Get an assistant by id
export const getAssistantById = query({
  args: {
    id: v.id("assistants"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const assistant = await ctx.db.get(args.id);
    return assistant;
  },
});






// Assign an assistant to a municipality
export const assignAssistantToMunicipality = mutation({
  args: {
    assistantId: v.id("assistants"),
    municipalityId: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const assistant = await ctx.db.get(args.assistantId);
    if (!assistant) {
      throw new ConvexError("Assistant not found");
    }
    
    // Check if assignment already exists
    const existingAssignment = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.assistantId))
      .filter(q => q.eq(q.field("municipalityId"), args.municipalityId))
      .first();
    
    if (existingAssignment) {
      throw new ConvexError("Assistant is already assigned to this municipality");
    }
    
    // Create new assignment in municipalityAssistants table
    await ctx.db.insert("municipalityAssistants", {
      assistantId: args.assistantId,
      municipalityId: args.municipalityId,
    });
  },
});

// Unassign an assistant from a municipality
export const unassignAssistantFromMunicipality = mutation({
  args: {
    assistantId: v.id("assistants"),
    municipalityId: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    // Find the assignment to delete
    const assignment = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.assistantId))
      .filter(q => q.eq(q.field("municipalityId"), args.municipalityId))
      .first();
    
    if (!assignment) {
      throw new ConvexError("Assignment not found");
    }
    
    // Delete the assignment
    await ctx.db.delete(assignment._id);
  },
});

// Get assistants assigned to a municipality
export const getAssistantByOrganization = query({
  args: {
    municipalityId: v.optional(v.string()),

  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    if (!args.municipalityId) {
      return [];
    }
    
    // Get all assignments for this municipality
    const assignments = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_municipality_id", q => q.eq("municipalityId", args.municipalityId!))
      .collect();
    
    // Get the actual assistant data for each assignment
    const assistants = await Promise.all(
      assignments.map(async (assignment) => {
        const assistant = await ctx.db.get(assignment.assistantId);
        return assistant;
      })
    );
    
    // Filter out any null results (in case an assistant was deleted)
    return assistants.filter(assistant => assistant !== null);
  },
});

// Get assistants by organization ID and assistant type
export const getAssistantsByOrganizationAndType = query({
  args: {
    organizationId: v.optional(v.string()),
    type: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("custom"))),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    let assistants;
    
    // Apply organization filter if provided
    if (args.organizationId) {
      assistants = await ctx.db
        .query("assistants")
        .withIndex("by_organization_id", q => q.eq("organizationId", args.organizationId))
        .collect();
    } else {
      // Get all assistants if no organization filter
      assistants = await ctx.db.query("assistants").collect();
    }
    
    // Apply type filter if provided
    if (args.type) {
      return assistants.filter(assistant => assistant.type === args.type);
    }
    
    return assistants;
  },
});




// Get all assistants with their assignment status for a specific municipality
export const getAllAssistantsWithAssignmentStatus = query({
  args: {
    municipalityId: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    // Get only custom type assistants
    const allAssistants = await ctx.db
      .query("assistants")
      .filter(q => q.eq(q.field("type"), "custom"))
      .take(50);
    
    // Get all assignments for this municipality
    const assignments = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_municipality_id", q => q.eq("municipalityId", args.municipalityId))
      .collect();
    
    const assignedAssistantIds = new Set(assignments.map(a => a.assistantId));
    
    // Return assistants with assignment status
    return allAssistants.map(assistant => ({
      ...assistant,
      isAssignedToMunicipality: assignedAssistantIds.has(assistant._id),
    }));
  },
});



// Update an assistant
export const updateAssistant = mutation({
  args: {
    id: v.id("assistants"),
    organizationId: v.optional(v.string()),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
    baseSystemPrompt: v.optional(v.string()),
    starterPrompt: v.optional(v.array(v.string())),
    type: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("custom"))),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    maxSteps: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    color: v.optional(v.string()),
    model: v.optional(v.string()),
    vectorStoreId: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    createdBy: v.optional(v.string()), // Optional for updates
    settings: v.optional(
      v.object({
        enableToolUse: v.optional(v.boolean()),
        allowedTools: v.optional(v.array(v.string())),
        maxHistoryMessages: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const assistant = await ctx.db.get(args.id);
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    
    // TODO: Verify user has permission to update this assistant

    const updates: Record<string, any> = {};
    if (args.organizationId !== undefined) updates.organizationId = args.organizationId;
    if (args.name !== undefined) updates.name = args.name;
    if (args.prompt !== undefined) updates.prompt = args.prompt;
    if (args.baseSystemPrompt !== undefined) updates.baseSystemPrompt = args.baseSystemPrompt;
    if (args.starterPrompt !== undefined) updates.starterPrompt = args.starterPrompt;
    if (args.type !== undefined) updates.type = args.type;
    if (args.temperature !== undefined) updates.temperature = args.temperature;
    if (args.maxTokens !== undefined) updates.maxTokens = args.maxTokens;
    if (args.maxSteps !== undefined) updates.maxSteps = args.maxSteps;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.color !== undefined) updates.color = args.color;
    if (args.model !== undefined) updates.model = args.model;
    if (args.vectorStoreId !== undefined) updates.vectorStoreId = args.vectorStoreId;
    if (args.countryCode !== undefined) updates.countryCode = args.countryCode;
    if (args.createdBy !== undefined) updates.createdBy = args.createdBy;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Deactivate and unassign an assistant (soft delete)
export const deactivateAssistant = mutation({
  args: {
    id: v.id("assistants"),
  },
  returns: v.object({
    deactivated: v.boolean(),
    unassigned: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const assistant = await ctx.db.get(args.id);
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    
    // Update assistant to be inactive and remove all municipality assignments
    await ctx.db.patch(args.id, {
      isActive: false,
    });
    
    // Remove all municipality assignments for this assistant
    const assignments = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.id))
      .collect();
    
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }
    
    return {
      deactivated: true,
      unassigned: true,
    };
  },
});

// Delete an assistant (hard delete)
export const deleteAssistant = mutation({
  args: {
    id: v.id("assistants"),
  },
  returns: v.object({
    deletedAssistant: v.boolean(),
    deletedMunicipalityAssignments: v.number(),
    deletedConversations: v.number(),
    deletedToolConfigurations: v.number(),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const assistant = await ctx.db.get(args.id);
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    
    let deletedMunicipalityAssignments = 0;
    let deletedConversations = 0;
    let deletedToolConfigurations = 0;
    
    // Remove municipality assignments
    const municipalityAssignments = await ctx.db
      .query("municipalityAssistants")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.id))
      .collect();
    
    for (const assignment of municipalityAssignments) {
      await ctx.db.delete(assignment._id);
      deletedMunicipalityAssignments++;
    }

    // Remove conversations (check for webConversations which use assistantId)
    const conversations = await ctx.db
      .query("webConversations")
      .filter(q => q.eq(q.field("assistantId"), args.id))
      .collect();
    
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
      deletedConversations++;
    }

    // Remove tool configurations
    const assistantTools = await ctx.db
      .query("assistantTools")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.id))
      .collect();
    
    for (const tool of assistantTools) {
      await ctx.db.delete(tool._id);
      deletedToolConfigurations++;
    }

    // Finally delete the assistant
    await ctx.db.delete(args.id);
    
    return {
      deletedAssistant: true,
      deletedMunicipalityAssignments,
      deletedConversations,
      deletedToolConfigurations,
    };
  },
});

