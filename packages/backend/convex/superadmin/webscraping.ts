

import { v, ConvexError } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";

// ========== CREATE MUTATIONS ==========

// Create a new scraper request params entry
export const createScraperRequestParams = mutation({
  args: {
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
    removeSelectors: v.optional(v.string()),
    waitForSelector: v.optional(v.string()),
    targetSelector: v.optional(v.string()),
    contentFormat: v.optional(v.string()),
    timeout: v.optional(v.number()),
    tokenBudget: v.optional(v.number()),
  },
  returns: v.id("scraperRequestParams"),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const now = Date.now();
    
    const scraperParamsId = await ctx.db.insert("scraperRequestParams", {
      baseUrl: args.baseUrl,
      netloc: args.netloc,
      browserEngine: args.browserEngine,
      removeSelectors: args.removeSelectors,
      waitForSelector: args.waitForSelector,
      targetSelector: args.targetSelector,
      contentFormat: args.contentFormat,
      timeout: args.timeout,
      tokenBudget: args.tokenBudget,
      createdAt: now,
      updatedAt: now,
    });

    return scraperParamsId;
  },
});

// ========== READ QUERIES ==========

// Get all scraper request params entries
export const getAllScraperRequestParams = query({
  args: {},
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const scraperParams = await ctx.db.query("scraperRequestParams").collect();
    return scraperParams;
  },
});

// Get scraper request params entry by ID
export const getScraperRequestParamsById = query({
  args: {
    id: v.id("scraperRequestParams"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const scraperParams = await ctx.db.get(args.id);
    return scraperParams;
  },
});

// Get scraper request params entries by base URL
export const getScraperRequestParamsByBaseUrl = query({
  args: {
    baseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db
      .query("scraperRequestParams")
      .withIndex("by_baseUrl", q => q.eq("baseUrl", args.baseUrl))
      .collect();
    
    return scraperParams;
  },
});

// Get scraper request params entries by netloc
export const getScraperRequestParamsByNetloc = query({
  args: {
    netloc: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db
      .query("scraperRequestParams")
      .withIndex("by_netloc", q => q.eq("netloc", args.netloc))
      .collect();
    
    return scraperParams;
  },
});

// Get scraper request params entries by browser engine
export const getScraperRequestParamsByBrowserEngine = query({
  args: {
    browserEngine: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db
      .query("scraperRequestParams")
      .withIndex("by_browserEngine", q => q.eq("browserEngine", args.browserEngine))
      .collect();
    
    return scraperParams;
  },
});

// Get scraper request params entries with filtering
export const getScraperRequestParamsWithFilters = query({
  args: {
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
    contentFormat: v.optional(v.string()),
    timeout: v.optional(v.number()),
    tokenBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    let query;
    
    // Choose index for optimization
    if (args.baseUrl !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_baseUrl", q => q.eq("baseUrl", args.baseUrl!));
    } else if (args.netloc !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_netloc", q => q.eq("netloc", args.netloc!));
    } else if (args.browserEngine !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_browserEngine", q => q.eq("browserEngine", args.browserEngine!));
    } else {
      query = ctx.db.query("scraperRequestParams");
    }

    // Collect results and apply strict AND filtering for ALL provided args
    const allResults = await query.collect();

    const filteredResults = allResults.filter(sp => {
      // Apply ALL filters as AND operations - all must match
      if (args.baseUrl !== undefined && sp.baseUrl !== args.baseUrl) return false;
      if (args.netloc !== undefined && sp.netloc !== args.netloc) return false;
      if (args.browserEngine !== undefined && sp.browserEngine !== args.browserEngine) return false;
      if (args.contentFormat !== undefined && sp.contentFormat !== args.contentFormat) return false;
      if (args.timeout !== undefined && sp.timeout !== args.timeout) return false;
      if (args.tokenBudget !== undefined && sp.tokenBudget !== args.tokenBudget) return false;
      return true;
    });

    return filteredResults;
  },
});

// Get scraper request params entries with pagination
export const getScraperRequestParamsWithPagination = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.optional(v.string()),
    }),
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const paginationOpts = {
      numItems: args.paginationOpts.numItems,
      cursor: args.paginationOpts.cursor ?? null,
    };

    // Apply filters
    if (args.baseUrl !== undefined) {
      const results = await ctx.db
        .query("scraperRequestParams")
        .withIndex("by_baseUrl", q => q.eq("baseUrl", args.baseUrl!))
        .paginate(paginationOpts);
      return results;
    } else if (args.netloc !== undefined) {
      const results = await ctx.db
        .query("scraperRequestParams")
        .withIndex("by_netloc", q => q.eq("netloc", args.netloc!))
        .paginate(paginationOpts);
      return results;
    } else if (args.browserEngine !== undefined) {
      const results = await ctx.db
        .query("scraperRequestParams")
        .withIndex("by_browserEngine", q => q.eq("browserEngine", args.browserEngine!))
        .paginate(paginationOpts);
      return results;
    } else {
      const results = await ctx.db
        .query("scraperRequestParams")
        .paginate(paginationOpts);
      return results;
    }
  },
});

// ========== UPDATE MUTATIONS ==========

// Update scraper request params entry
export const updateScraperRequestParams = mutation({
  args: {
    id: v.id("scraperRequestParams"),
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
    removeSelectors: v.optional(v.string()),
    waitForSelector: v.optional(v.string()),
    targetSelector: v.optional(v.string()),
    contentFormat: v.optional(v.string()),
    timeout: v.optional(v.number()),
    tokenBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db.get(args.id);
    if (!scraperParams) {
      throw new ConvexError("Scraper request params entry not found");
    }

    const updates: Record<string, any> = {};
    if (args.baseUrl !== undefined) updates.baseUrl = args.baseUrl;
    if (args.netloc !== undefined) updates.netloc = args.netloc;
    if (args.browserEngine !== undefined) updates.browserEngine = args.browserEngine;
    if (args.removeSelectors !== undefined) updates.removeSelectors = args.removeSelectors;
    if (args.waitForSelector !== undefined) updates.waitForSelector = args.waitForSelector;
    if (args.targetSelector !== undefined) updates.targetSelector = args.targetSelector;
    if (args.contentFormat !== undefined) updates.contentFormat = args.contentFormat;
    if (args.timeout !== undefined) updates.timeout = args.timeout;
    if (args.tokenBudget !== undefined) updates.tokenBudget = args.tokenBudget;
    
    // Always update the updatedAt timestamp
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Batch update scraper request params by filter criteria
export const updateScraperRequestParamsByFilter = mutation({
  args: {
    // Filter criteria - at least one must be provided
    filterCriteria: v.object({
      baseUrl: v.optional(v.string()),
      netloc: v.optional(v.string()),
      browserEngine: v.optional(v.string()),
      contentFormat: v.optional(v.string()),
      timeout: v.optional(v.number()),
      tokenBudget: v.optional(v.number()),
    }),
    // Fields to update - at least one must be provided
    updateFields: v.object({
      baseUrl: v.optional(v.string()),
      netloc: v.optional(v.string()),
      browserEngine: v.optional(v.string()),
      removeSelectors: v.optional(v.string()),
      waitForSelector: v.optional(v.string()),
      targetSelector: v.optional(v.string()),
      contentFormat: v.optional(v.string()),
      timeout: v.optional(v.number()),
      tokenBudget: v.optional(v.number()),
    }),
  },
  returns: v.object({
    matchedCount: v.number(),
    updatedCount: v.number(),
    updatedIds: v.array(v.id("scraperRequestParams")),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const { filterCriteria, updateFields } = args;
    
    // Validate that at least one filter criterion is provided
    const hasFilterCriteria = Object.values(filterCriteria).some(value => value !== undefined);
    if (!hasFilterCriteria) {
      throw new ConvexError("At least one filter criterion must be provided");
    }
    
    // Validate that at least one update field is provided
    const hasUpdateFields = Object.values(updateFields).some(value => value !== undefined);
    if (!hasUpdateFields) {
      throw new ConvexError("At least one update field must be provided");
    }

    // Choose the most optimal index based on provided filter criteria
    let query;
    if (filterCriteria.baseUrl !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_baseUrl", q => q.eq("baseUrl", filterCriteria.baseUrl!));
    } else if (filterCriteria.netloc !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_netloc", q => q.eq("netloc", filterCriteria.netloc!));
    } else if (filterCriteria.browserEngine !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_browserEngine", q => q.eq("browserEngine", filterCriteria.browserEngine!));
    } else {
      query = ctx.db.query("scraperRequestParams");
    }

    // Get all results and apply filtering
    const allResults = await query.collect();
    
    // Apply ALL filter criteria as AND operations
    const matchedEntries = allResults.filter(sp => {
      if (filterCriteria.baseUrl !== undefined && sp.baseUrl !== filterCriteria.baseUrl) return false;
      if (filterCriteria.netloc !== undefined && sp.netloc !== filterCriteria.netloc) return false;
      if (filterCriteria.browserEngine !== undefined && sp.browserEngine !== filterCriteria.browserEngine) return false;
      if (filterCriteria.contentFormat !== undefined && sp.contentFormat !== filterCriteria.contentFormat) return false;
      if (filterCriteria.timeout !== undefined && sp.timeout !== filterCriteria.timeout) return false;
      if (filterCriteria.tokenBudget !== undefined && sp.tokenBudget !== filterCriteria.tokenBudget) return false;
      return true;
    });

    // Prepare update object with only defined fields
    const updates: Record<string, any> = {};
    if (updateFields.baseUrl !== undefined) updates.baseUrl = updateFields.baseUrl;
    if (updateFields.netloc !== undefined) updates.netloc = updateFields.netloc;
    if (updateFields.browserEngine !== undefined) updates.browserEngine = updateFields.browserEngine;
    if (updateFields.removeSelectors !== undefined) updates.removeSelectors = updateFields.removeSelectors;
    if (updateFields.waitForSelector !== undefined) updates.waitForSelector = updateFields.waitForSelector;
    if (updateFields.targetSelector !== undefined) updates.targetSelector = updateFields.targetSelector;
    if (updateFields.contentFormat !== undefined) updates.contentFormat = updateFields.contentFormat;
    if (updateFields.timeout !== undefined) updates.timeout = updateFields.timeout;
    if (updateFields.tokenBudget !== undefined) updates.tokenBudget = updateFields.tokenBudget;
    
    // Always update the updatedAt timestamp
    updates.updatedAt = Date.now();

    // Update all matched entries
    const updatedIds: any[] = [];
    let updatedCount = 0;

    for (const entry of matchedEntries) {
      try {
        await ctx.db.patch(entry._id, updates);
        updatedIds.push(entry._id);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update entry ${entry._id}:`, error);
        // Continue with other entries even if one fails
      }
    }

    return {
      matchedCount: matchedEntries.length,
      updatedCount,
      updatedIds,
    };
  },
});

// ========== DELETE MUTATIONS ==========

// Delete scraper request params entry by ID
export const deleteScraperRequestParams = mutation({
  args: {
    id: v.id("scraperRequestParams"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db.get(args.id);
    if (!scraperParams) {
      throw new ConvexError("Scraper request params entry not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete multiple scraper request params entries by filter criteria
export const deleteScraperRequestParamsByFilter = mutation({
  args: {
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
    contentFormat: v.optional(v.string()),
    timeout: v.optional(v.number()),
    tokenBudget: v.optional(v.number()),
  },
  returns: v.object({
    deletedCount: v.number(),
    deletedIds: v.array(v.id("scraperRequestParams")),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    // Validate that at least one filter criterion is provided
    const hasFilterCriteria = Object.values(args).some(value => value !== undefined);
    if (!hasFilterCriteria) {
      throw new ConvexError("At least one filter criterion must be provided");
    }

    // Choose the most optimal index based on provided filter criteria
    let query;
    if (args.baseUrl !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_baseUrl", q => q.eq("baseUrl", args.baseUrl!));
    } else if (args.netloc !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_netloc", q => q.eq("netloc", args.netloc!));
    } else if (args.browserEngine !== undefined) {
      query = ctx.db
        .query("scraperRequestParams")
        .withIndex("by_browserEngine", q => q.eq("browserEngine", args.browserEngine!));
    } else {
      query = ctx.db.query("scraperRequestParams");
    }

    // Get all results and apply filtering
    const allResults = await query.collect();
    
    // Apply ALL filter criteria as AND operations
    const matchedEntries = allResults.filter(sp => {
      if (args.baseUrl !== undefined && sp.baseUrl !== args.baseUrl) return false;
      if (args.netloc !== undefined && sp.netloc !== args.netloc) return false;
      if (args.browserEngine !== undefined && sp.browserEngine !== args.browserEngine) return false;
      if (args.contentFormat !== undefined && sp.contentFormat !== args.contentFormat) return false;
      if (args.timeout !== undefined && sp.timeout !== args.timeout) return false;
      if (args.tokenBudget !== undefined && sp.tokenBudget !== args.tokenBudget) return false;
      return true;
    });

    // Delete all matched entries
    const deletedIds: any[] = [];
    let deletedCount = 0;

    for (const entry of matchedEntries) {
      try {
        await ctx.db.delete(entry._id);
        deletedIds.push(entry._id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete entry ${entry._id}:`, error);
        // Continue with other entries even if one fails
      }
    }

    return {
      deletedCount,
      deletedIds,
    };
  },
});

// ========== UTILITY QUERIES ==========

// Get scraper request params statistics
export const getScraperRequestParamsStats = query({
  args: {},
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const scraperParams = await ctx.db.query("scraperRequestParams").collect();

    const stats = {
      total: scraperParams.length,
      byBrowserEngine: {} as Record<string, number>,
      byContentFormat: {} as Record<string, number>,
      avgTimeout: 0,
      avgTokenBudget: 0,
      uniqueBaseUrls: new Set(scraperParams.map(sp => sp.baseUrl).filter(Boolean)).size,
      uniqueNetlocs: new Set(scraperParams.map(sp => sp.netloc).filter(Boolean)).size,
    };

    // Calculate statistics
    scraperParams.forEach(sp => {
      // Browser engine stats
      if (sp.browserEngine) {
        stats.byBrowserEngine[sp.browserEngine] = (stats.byBrowserEngine[sp.browserEngine] || 0) + 1;
      }
      
      // Content format stats
      if (sp.contentFormat) {
        stats.byContentFormat[sp.contentFormat] = (stats.byContentFormat[sp.contentFormat] || 0) + 1;
      }
    });

    // Calculate averages
    const timeouts = scraperParams.filter(sp => sp.timeout).map(sp => sp.timeout!);
    const tokenBudgets = scraperParams.filter(sp => sp.tokenBudget).map(sp => sp.tokenBudget!);
    
    stats.avgTimeout = timeouts.length > 0 ? timeouts.reduce((sum, t) => sum + t, 0) / timeouts.length : 0;
    stats.avgTokenBudget = tokenBudgets.length > 0 ? tokenBudgets.reduce((sum, tb) => sum + tb, 0) / tokenBudgets.length : 0;

    return stats;
  },
});

// Internal query to get scraper request params by ID (no auth required)
export const getScraperRequestParamsByIdInternal = internalQuery({
  args: {
    id: v.id("scraperRequestParams"),
  },
  handler: async (ctx, args) => {
    const scraperParams = await ctx.db.get(args.id);
    return scraperParams;
  },
});


