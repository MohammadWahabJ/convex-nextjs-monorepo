import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";
import type { Id } from "../_generated/dataModel";

// Create a new tool definition
export const createTool = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.string(),
  },
  returns: v.id("tools"),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    // Check if tool with this name already exists
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_name", q => q.eq("name", args.name))
      .first();
    
    if (existing) {
      throw new Error(`Tool with name "${args.name}" already exists`);
    }
    
    return await ctx.db.insert("tools", {
      name: args.name,
      description: args.description,
      type: args.type,
    });
  },
});

// Assign a tool to an assistant with dynamic configuration based on tool type
export const assignToolToAssistant = mutation({
  args: {
    assistantId: v.id("assistants"),
    toolId: v.id("tools"),
    // Qdrant tool fields
    collectionName: v.optional(v.string()),
    defaultLimit: v.optional(v.number()),
    defaultFilter: v.optional(v.string()),
    // Web tool fields
    urls: v.optional(v.array(v.string())),
    crawlDepth: v.optional(v.number()),
    // Search tool fields
    defaultQuery: v.optional(v.string()),
    searchEngine: v.optional(v.string()),
    maxResults: v.optional(v.number()),
  },
  returns: v.id("assistantTools"),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    // Verify assistant exists
    const assistant = await ctx.db.get(args.assistantId);
    if (!assistant) {
      throw new Error("Assistant not found");
    }
    
    // Verify tool exists
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }
    
    // Validate required fields based on tool type
    if (tool.type === "qdrant" && !args.collectionName) {
      throw new Error("Collection name is required for Qdrant tools");
    }
    if (tool.type === "web" && (!args.urls || args.urls.length === 0)) {
      throw new Error("At least one URL is required for web tools");
    }
    if (tool.type === "search" && !args.defaultQuery) {
      throw new Error("Default query is required for search tools");
    }
    
    // Check if this combination already exists (based on tool type)
    let existing;
    if (tool.type === "qdrant") {
      existing = await ctx.db
        .query("assistantTools")
        .withIndex("by_assistant_and_tool", q => 
          q.eq("assistantId", args.assistantId).eq("toolId", args.toolId)
        )
        .filter(q => q.eq(q.field("collectionName"), args.collectionName))
        .first();
    } else {
      existing = await ctx.db
        .query("assistantTools")
        .withIndex("by_assistant_and_tool", q => 
          q.eq("assistantId", args.assistantId).eq("toolId", args.toolId)
        )
        .first();
    }
    
    if (existing) {
      throw new Error("This tool is already assigned to this assistant");
    }
    
    // Prepare the tool configuration based on tool type
    const toolConfig: any = {
      assistantId: args.assistantId,
      toolId: args.toolId,
    };
    
    // Add tool-specific fields
    if (tool.type === "qdrant") {
      toolConfig.collectionName = args.collectionName;
      toolConfig.defaultLimit = args.defaultLimit;
      toolConfig.defaultFilter = args.defaultFilter;
    } else if (tool.type === "web") {
      toolConfig.urls = args.urls;
      toolConfig.crawlDepth = args.crawlDepth;
    } else if (tool.type === "search") {
      toolConfig.defaultQuery = args.defaultQuery;
      toolConfig.searchEngine = args.searchEngine;
      toolConfig.maxResults = args.maxResults;
    }
    
    return await ctx.db.insert("assistantTools", toolConfig);
  },
});

// Remove a tool from an assistant
export const removeToolFromAssistant = mutation({
  args: {
    assistantToolId: v.id("assistantTools"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const assistantTool = await ctx.db.get(args.assistantToolId);
    if (!assistantTool) {
      throw new Error("Assistant tool assignment not found");
    }
    
    await ctx.db.delete(args.assistantToolId);
    return null;
  },
});

// Get all tools configured for an assistant
export const getToolsByAssistant = query({
  args: {
    assistantId: v.id("assistants"),
  },
  returns: v.array(v.object({
    _id: v.id("assistantTools"),
    toolId: v.id("tools"),
    // Qdrant tool fields
    collectionName: v.optional(v.string()),
    defaultLimit: v.optional(v.number()),
    defaultFilter: v.optional(v.string()),
    // Web tool fields
    urls: v.optional(v.array(v.string())),
    crawlDepth: v.optional(v.number()),
    // Search tool fields
    defaultQuery: v.optional(v.string()),
    searchEngine: v.optional(v.string()),
    maxResults: v.optional(v.number()),
    tool: v.object({
      _id: v.id("tools"),
      name: v.string(),
      description: v.string(),
      type: v.string(),
    }),
  })),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const assistantTools = await ctx.db
      .query("assistantTools")
      .withIndex("by_assistant_id", q => q.eq("assistantId", args.assistantId))
      .collect();
    
    const result = await Promise.all(
      assistantTools.map(async (at) => {
        const tool = await ctx.db.get(at.toolId);
        if (!tool) return null;
        
        return {
          _id: at._id,
          toolId: at.toolId,
          // Qdrant tool fields
          collectionName: at.collectionName,
          defaultLimit: at.defaultLimit,
          defaultFilter: at.defaultFilter,
          // Web tool fields
          urls: at.urls,
          crawlDepth: at.crawlDepth,
          // Search tool fields
          defaultQuery: at.defaultQuery,
          searchEngine: at.searchEngine,
          maxResults: at.maxResults,
          tool: {
            _id: tool._id,
            name: tool.name,
            description: tool.description,
            type: tool.type,
          },
        };
      })
    );
    
    return result.filter(t => t !== null);
  },
});

// Update assistant tool configuration
export const updateAssistantToolConfig = mutation({
  args: {
    assistantToolId: v.id("assistantTools"),
    // Qdrant tool fields
    collectionName: v.optional(v.string()),
    defaultLimit: v.optional(v.number()),
    defaultFilter: v.optional(v.string()),
    // Web tool fields
    urls: v.optional(v.array(v.string())),
    crawlDepth: v.optional(v.number()),
    // Search tool fields
    defaultQuery: v.optional(v.string()),
    searchEngine: v.optional(v.string()),
    maxResults: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const assistantTool = await ctx.db.get(args.assistantToolId);
    if (!assistantTool) {
      throw new Error("Assistant tool assignment not found");
    }
    
    const updates: Record<string, any> = {};
    
    // Qdrant tool fields
    if (args.collectionName !== undefined) updates.collectionName = args.collectionName;
    if (args.defaultLimit !== undefined) updates.defaultLimit = args.defaultLimit;
    if (args.defaultFilter !== undefined) updates.defaultFilter = args.defaultFilter;
    
    // Web tool fields
    if (args.urls !== undefined) updates.urls = args.urls;
    if (args.crawlDepth !== undefined) updates.crawlDepth = args.crawlDepth;
    
    // Search tool fields
    if (args.defaultQuery !== undefined) updates.defaultQuery = args.defaultQuery;
    if (args.searchEngine !== undefined) updates.searchEngine = args.searchEngine;
    if (args.maxResults !== undefined) updates.maxResults = args.maxResults;
    
    await ctx.db.patch(args.assistantToolId, updates);
    return null;
  },
});

// Seed the Qdrant search tool
export const seedQdrantTool = mutation({
  args: {},
  returns: v.id("tools"),
  handler: async (ctx) => {
    await checkUserAuthenticated(ctx);
    
    // Check if tool already exists
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_name", q => q.eq("name", "qdrant_search"))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("tools", {
      name: "qdrant_search",
      description: "Search knowledge base using semantic similarity",
      type: "qdrant",
    });
  },
});

// Get all available tools
export const getAllTools = query({
  args: {},

  handler: async (ctx) => {
    await checkUserAuthenticated(ctx);
    
    const tools = await ctx.db.query("tools").collect();
    return tools;
  },
});

// Update a tool
export const updateTool = mutation({
  args: {
    id: v.id("tools"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const tool = await ctx.db.get(args.id);
    if (!tool) {
      throw new Error("Tool not found");
    }
    
    const updates: Record<string, string | undefined> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.type !== undefined) updates.type = args.type;
    
    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Delete a tool
export const deleteTool = mutation({
  args: {
    id: v.id("tools"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkUserAuthenticated(ctx);
    
    const tool = await ctx.db.get(args.id);
    if (!tool) {
      throw new Error("Tool not found");
    }
    
    // TODO: Check if tool is assigned to any assistants
    // TODO: Remove all assistant tool assignments
    
    await ctx.db.delete(args.id);
    return null;
  },
});
