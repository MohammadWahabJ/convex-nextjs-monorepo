import { v, ConvexError } from "convex/values";
import { mutation, query, internalQuery, action } from "../_generated/server";

// Create a knowledge base entry
export const createKnowledgeBase = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    taskId: v.string(),
    sourceUrl: v.string(),
    organizationId: v.optional(v.string()),
    assistantId: v.id("assistants"),
    fileType: v.union(
      v.literal("document"),
      v.literal("link"),
      v.literal("sitemap"),
      v.literal("text")
    ),
    fileSize: v.optional(v.string()),
    uploadedBy: v.string(),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    )),
    processingError: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    frequency: v.optional(v.union(v.literal("never"), v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    chunkCount: v.optional(v.number()),
    itemExternalId: v.optional(v.string()),
    includeImg: v.optional(v.boolean()),
    includeDoc: v.optional(v.boolean()),
    metadata: v.optional(
      v.object({
        pageCount: v.optional(v.number()),
        wordCount: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  returns: v.id("superAdminKnowledgebases"),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    // Verify assistant exists
    const assistant = await ctx.db.get(args.assistantId);
    if (!assistant) {
      throw new ConvexError("Assistant not found");
    }

    const knowledgeBaseId = await ctx.db.insert("superAdminKnowledgebases", {
      title: args.title,
      description: args.description,
      taskId: args.taskId,
      sourceUrl: args.sourceUrl,
      assistantId: args.assistantId,
      organizationId: args.organizationId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: args.uploadedBy,
      itemExternalId: args.itemExternalId,
      includeImg: args.includeImg,
      includeDoc: args.includeDoc,
      isActive: args.isActive ?? true,
      status: args.status ?? "pending",
      processingError: args.processingError,
      contentHash: args.contentHash,
      frequency: args.frequency ?? "never",
      chunkCount: args.chunkCount,
      metadata: args.metadata,
      createdAt: args.createdAt ?? Date.now(),
      updatedAt: args.updatedAt ?? Date.now(),
    });

    return knowledgeBaseId;
  },
});

export const submitSingleUrl = action({
  args: {
    assistantId: v.string(),
    organizationId: v.optional(v.string()),
    collectionName: v.string(),
    uploadedBy: v.string(),
    sourceUrl: v.string(), 
    includeImg: v.boolean(),
    includeDoc: v.boolean(),
    taskId: v.string(),         //random uuid
    frequency: v.string(),
    workflowId: v.string(),      //random uuid
    storeType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Replace with your actual n8n webhook URL
      const n8nWebhookUrl = "https://backend.dev.ki2.at/webhook/ki2/single-url-submit";

      // Prepare the payload for n8n
      const payload = {
        assistant_id: args.assistantId,
        organization_id: args.organizationId,
        collectionName: args.collectionName,
        uploaded_by: args.uploadedBy,
        source_url: args.sourceUrl,
        include_img: args.includeImg,
        include_doc: args.includeDoc,
        task_id: args.taskId,
        frequency: args.frequency,
        workflow_id: args.workflowId,
        store_type: args.storeType,
      };

      // Call n8n webhook
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `n8n responded with status ${response.status}`,
        };
      }

      // Optionally, parse n8n response
      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error connecting to n8n:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Get all knowledge base entries
export const getAllKnowledgeBases = query({
  args: {},
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const knowledgeBases = await ctx.db.query("superAdminKnowledgebases").take(100);
    return knowledgeBases;
  },
});

// Get knowledge base entry by ID
export const getKnowledgeBaseById = query({
  args: {
    id: v.id("superAdminKnowledgebases"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const knowledgeBase = await ctx.db.get(args.id);
    return knowledgeBase;
  },
});

// Get knowledge base entries by assistant ID
export const getKnowledgeBasesByAssistantId = query({
  args: {
    assistantId: v.id("assistants"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    // Verify assistant exists
    const assistant = await ctx.db.get(args.assistantId);
    if (!assistant) {
      throw new ConvexError("Assistant not found");
    }

    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_assistantId", q => q.eq("assistantId", args.assistantId))
      .collect();
    
    return knowledgeBases;
  },
});

// Get knowledge base entries by organization ID
export const getKnowledgeBasesByOrganizationId = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_organizationId", q => q.eq("organizationId", args.organizationId))
      .collect();
    
    return knowledgeBases;
  },
});

// Get knowledge base entries by source URL
export const getKnowledgeBasesBySourceUrl = query({
  args: {
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_sourceUrl", q => q.eq("sourceUrl", args.sourceUrl))
      .collect();
    
    return knowledgeBases;
  },
});

// Get knowledge base entries with flexible filtering
export const getKnowledgeBasesWithFilters = query({
  args: {
    assistantId: v.optional(v.id("assistants")),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    )),
    uploadedBy: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    fileType: v.optional(v.union(
      v.literal("document"),
      v.literal("link"),
      v.literal("sitemap"),
      v.literal("text")
    )),
    isActive: v.optional(v.boolean()),
    frequency: v.optional(v.union(
      v.literal("never"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    )),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    let query;
    
      // Choose index for optimization: prefer assistantId, then organizationId, then sourceUrl
      if (args.assistantId !== undefined) {
        // Verify assistant exists
        const assistant = await ctx.db.get(args.assistantId);
        if (!assistant) {
          throw new ConvexError("Assistant not found");
        }
        const assistantId = args.assistantId;
        query = ctx.db
          .query("superAdminKnowledgebases")
          .withIndex("by_assistantId", q => q.eq("assistantId", assistantId));
      } else if (args.organizationId !== undefined) {
        const organizationId = args.organizationId;
        query = ctx.db
          .query("superAdminKnowledgebases")
          .withIndex("by_organizationId", q => q.eq("organizationId", organizationId));
      } else if (args.sourceUrl !== undefined) {
        const sourceUrl = args.sourceUrl;
        query = ctx.db
          .query("superAdminKnowledgebases")
          .withIndex("by_sourceUrl", q => q.eq("sourceUrl", sourceUrl));
      } else {
        query = ctx.db.query("superAdminKnowledgebases");
      }    // Collect results and apply strict AND filtering for ALL provided args
    const allResults = await query.collect();

    const filteredResults = allResults.filter(kb => {
      // Apply ALL filters as AND operations - all must match
      if (args.assistantId !== undefined && kb.assistantId !== args.assistantId) return false;
      if (args.organizationId !== undefined && kb.organizationId !== args.organizationId) return false;
      if (args.sourceUrl !== undefined && kb.sourceUrl !== args.sourceUrl) return false;
      if (args.status !== undefined && kb.status !== args.status) return false;
      if (args.uploadedBy !== undefined && kb.uploadedBy !== args.uploadedBy) return false;
      if (args.fileType !== undefined && kb.fileType !== args.fileType) return false;
      if (args.isActive !== undefined && kb.isActive !== args.isActive) return false;
      if (args.frequency !== undefined && kb.frequency !== args.frequency) return false;
      if (args.department !== undefined && kb.department !== args.department) return false;
      return true;
    });

    return filteredResults;
    },
  });

// Get knowledge base entries by status
export const getKnowledgeBasesByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_status", q => q.eq("status", args.status))
      .collect();
    
    return knowledgeBases;
  },
});

// Get knowledge base entries by uploader
export const getKnowledgeBasesByUploader = query({
  args: {
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_uploadedBy", q => q.eq("uploadedBy", args.uploadedBy))
      .collect();
    
    return knowledgeBases;
  },
});





// Update knowledge base entry
export const updateKnowledgeBase = mutation({
  args: {
    id: v.id("superAdminKnowledgebases"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    taskId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    department: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    itemExternalId: v.optional(v.string()),
    includeImg: v.optional(v.boolean()),
    includeDoc: v.optional(v.boolean()),
    assistantId: v.optional(v.id("assistants")),
    fileType: v.optional(v.union(
      v.literal("document"),
      v.literal("link"),
      v.literal("sitemap"),
      v.literal("text")
    )),
    fileSize: v.optional(v.string()),
    uploadedBy: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    )),
    processingError: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    frequency: v.optional(v.union(v.literal("never"), v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    chunkCount: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        pageCount: v.optional(v.number()),
        wordCount: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase) {
      throw new ConvexError("Knowledge base entry not found");
    }

    // If updating assistantId, verify the new assistant exists
    if (args.assistantId !== undefined) {
      const assistant = await ctx.db.get(args.assistantId);
      if (!assistant) {
        throw new ConvexError("Assistant not found");
      }
    }

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.taskId !== undefined) updates.taskId = args.taskId;
    if (args.sourceUrl !== undefined) updates.sourceUrl = args.sourceUrl;
    if (args.department !== undefined) updates.department = args.department;
    if (args.organizationId !== undefined) updates.organizationId = args.organizationId;
    if (args.itemExternalId !== undefined) updates.itemExternalId = args.itemExternalId;
    if (args.includeImg !== undefined) updates.includeImg = args.includeImg;
    if (args.includeDoc !== undefined) updates.includeDoc = args.includeDoc;
    if (args.assistantId !== undefined) updates.assistantId = args.assistantId;
    if (args.fileType !== undefined) updates.fileType = args.fileType;
    if (args.fileSize !== undefined) updates.fileSize = args.fileSize;
    if (args.uploadedBy !== undefined) updates.uploadedBy = args.uploadedBy;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.status !== undefined) updates.status = args.status;
    if (args.processingError !== undefined) updates.processingError = args.processingError;
    if (args.contentHash !== undefined) updates.contentHash = args.contentHash;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.chunkCount !== undefined) updates.chunkCount = args.chunkCount;
    if (args.metadata !== undefined) updates.metadata = args.metadata;
    if (args.createdAt !== undefined) updates.createdAt = args.createdAt;
    if (args.updatedAt !== undefined) updates.updatedAt = args.updatedAt;
    
    // Always update the updatedAt timestamp
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Update knowledge base status (commonly used operation)
export const updateKnowledgeBaseStatus = mutation({
  args: {
    id: v.id("superAdminKnowledgebases"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    ),
    processingError: v.optional(v.string()),
    chunkCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase) {
      throw new ConvexError("Knowledge base entry not found");
    }

    const updates: Record<string, any> = { status: args.status };
    if (args.processingError !== undefined) updates.processingError = args.processingError;
    if (args.chunkCount !== undefined) updates.chunkCount = args.chunkCount;
    
    // Always update the updatedAt timestamp
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

// Soft delete (mark as deleted)
export const softDeleteKnowledgeBase = mutation({
  args: {
    id: v.id("superAdminKnowledgebases"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase) {
      throw new ConvexError("Knowledge base entry not found");
    }

    await ctx.db.patch(args.id, {
      status: "deleted",
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Hard delete knowledge base entry
export const deleteKnowledgeBase = mutation({
  args: {
    id: v.id("superAdminKnowledgebases"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase) {
      throw new ConvexError("Knowledge base entry not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete all knowledge base entries for a specific assistant
export const deleteKnowledgeBasesByAssistantId = mutation({
  args: {
    assistantId: v.id("assistants"),
  },
  returns: v.object({
    deletedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBases = await ctx.db
      .query("superAdminKnowledgebases")
      .withIndex("by_assistantId", q => q.eq("assistantId", args.assistantId))
      .collect();

    let deletedCount = 0;
    for (const kb of knowledgeBases) {
      await ctx.db.delete(kb._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

// Toggle active status
export const toggleKnowledgeBaseActive = mutation({
  args: {
    id: v.id("superAdminKnowledgebases"),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const knowledgeBase = await ctx.db.get(args.id);
    if (!knowledgeBase) {
      throw new ConvexError("Knowledge base entry not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !knowledgeBase.isActive,
      updatedAt: Date.now(),
    });

    return { isActive: !knowledgeBase.isActive };
  },
});

// Get knowledge base entries with pagination
export const getKnowledgeBasesWithPagination = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.optional(v.string()),
    }),
    assistantId: v.optional(v.id("assistants")),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    const paginationOpts = {
      numItems: args.paginationOpts.numItems,
      cursor: args.paginationOpts.cursor ?? null,
    };

    // Apply filters
    if (args.assistantId !== undefined) {
      const results = await ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_assistantId", q => q.eq("assistantId", args.assistantId!))
        .paginate(paginationOpts);
      return results;
    } else if (args.status !== undefined) {
      const results = await ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_status", q => q.eq("status", args.status!))
        .paginate(paginationOpts);
      return results;
    } else {
      const results = await ctx.db
        .query("superAdminKnowledgebases")
        .paginate(paginationOpts);
      return results;
    }
  },
});

// Internal query to get knowledge base by ID (no auth required)
export const getKnowledgeBaseByIdInternal = internalQuery({
  args: {
    id: v.id("superAdminKnowledgebases"),
  },
  handler: async (ctx, args) => {
    const knowledgeBase = await ctx.db.get(args.id);
    return knowledgeBase;
  },
});

// Get knowledge base statistics
export const getKnowledgeBaseStats = query({
  args: {
    assistantId: v.optional(v.id("assistants")),
  },
  handler: async (ctx, args) => {
    // await checkUserAuthenticated(ctx);
    
    let knowledgeBases;
    if (args.assistantId !== undefined) {
      knowledgeBases = await ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_assistantId", q => q.eq("assistantId", args.assistantId!))
        .collect();
    } else {
      knowledgeBases = await ctx.db.query("superAdminKnowledgebases").collect();
    }

    const stats = {
      total: knowledgeBases.length,
      active: knowledgeBases.filter(kb => kb.isActive).length,
      inactive: knowledgeBases.filter(kb => !kb.isActive).length,
      byStatus: {
        pending: knowledgeBases.filter(kb => kb.status === "pending").length,
        processing: knowledgeBases.filter(kb => kb.status === "processing").length,
        completed: knowledgeBases.filter(kb => kb.status === "completed").length,
        failed: knowledgeBases.filter(kb => kb.status === "failed").length,
        deleted: knowledgeBases.filter(kb => kb.status === "deleted").length,
      },
      byFileType: {
        document: knowledgeBases.filter(kb => kb.fileType === "document").length,
        link: knowledgeBases.filter(kb => kb.fileType === "link").length,
        sitemap: knowledgeBases.filter(kb => kb.fileType === "sitemap").length,
        text: knowledgeBases.filter(kb => kb.fileType === "text").length,
      },
      totalFileSize: knowledgeBases.reduce((sum, kb) => {
        const fileSize = kb.fileSize ? parseInt(kb.fileSize) || 0 : 0;
        return sum + fileSize;
      }, 0),
      totalChunks: knowledgeBases.reduce((sum, kb) => sum + (kb.chunkCount ?? 0), 0),
    };

    return stats;
  },
});

// Update knowledge base entries by filter criteria
export const updateKnowledgeBaseByFilter = mutation({
  args: {
    // Filter criteria - at least one must be provided
    filterCriteria: v.object({
      organizationId: v.optional(v.string()),
      assistantId: v.optional(v.id("assistants")),
      sourceUrl: v.optional(v.string()),
      taskId: v.optional(v.string()),
      uploadedBy: v.optional(v.string()),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      itemExternalId: v.optional(v.string()),
      includeImg: v.optional(v.boolean()),
      includeDoc: v.optional(v.boolean()),
      fileType: v.optional(v.union(
        v.literal("document"),
        v.literal("link"),
        v.literal("sitemap"),
        v.literal("text")
      )),
      fileSize: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("deleted"),
        v.literal("not found"),
        v.literal("failed")
      )),
      processingError: v.optional(v.string()),
      contentHash: v.optional(v.string()),
      frequency: v.optional(v.union(
        v.literal("never"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )),
      chunkCount: v.optional(v.number()),
      department: v.optional(v.string()),
    }),
    // Fields to update - at least one must be provided
    updateFields: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      taskId: v.optional(v.string()),
      sourceUrl: v.optional(v.string()),
      department: v.optional(v.string()),
      organizationId: v.optional(v.string()),
      itemExternalId: v.optional(v.string()),
      includeImg: v.optional(v.boolean()),
      includeDoc: v.optional(v.boolean()),
      assistantId: v.optional(v.id("assistants")),
      fileType: v.optional(v.union(
        v.literal("document"),
        v.literal("link"),
        v.literal("sitemap"),
        v.literal("text")
      )),
      fileSize: v.optional(v.string()),
      uploadedBy: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("deleted"),
        v.literal("not found"),
        v.literal("failed")
      )),
      processingError: v.optional(v.string()),
      contentHash: v.optional(v.string()),
      frequency: v.optional(v.union(
        v.literal("never"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )),
      chunkCount: v.optional(v.number()),
      metadata: v.optional(
        v.object({
          pageCount: v.optional(v.number()),
          wordCount: v.optional(v.number()),
          language: v.optional(v.string()),
        })
      ),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),
  },
  returns: v.object({
    matchedCount: v.number(),
    updatedCount: v.number(),
    updatedIds: v.array(v.id("superAdminKnowledgebases")),
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

    // If updating assistantId in filter criteria, verify the assistant exists
    if (filterCriteria.assistantId !== undefined) {
      const assistant = await ctx.db.get(filterCriteria.assistantId);
      if (!assistant) {
        throw new ConvexError("Assistant not found");
      }
    }

    // Choose the most optimal index based on provided filter criteria
    let query;
    if (filterCriteria.assistantId !== undefined) {
      query = ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_assistantId", q => q.eq("assistantId", filterCriteria.assistantId!));
    } else if (filterCriteria.organizationId !== undefined) {
      query = ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_organizationId", q => q.eq("organizationId", filterCriteria.organizationId!));
    } else if (filterCriteria.sourceUrl !== undefined) {
      query = ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_sourceUrl", q => q.eq("sourceUrl", filterCriteria.sourceUrl!));
    } else if (filterCriteria.status !== undefined) {
      query = ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_status", q => q.eq("status", filterCriteria.status!));
    } else if (filterCriteria.uploadedBy !== undefined) {
      query = ctx.db
        .query("superAdminKnowledgebases")
        .withIndex("by_uploadedBy", q => q.eq("uploadedBy", filterCriteria.uploadedBy!));
    } else {
      query = ctx.db.query("superAdminKnowledgebases");
    }

    // Get all results and apply filtering
    const allResults = await query.collect();
    
    // Apply ALL filter criteria as AND operations
    const matchedEntries = allResults.filter(kb => {
      if (filterCriteria.organizationId !== undefined && kb.organizationId !== filterCriteria.organizationId) return false;
      if (filterCriteria.assistantId !== undefined && kb.assistantId !== filterCriteria.assistantId) return false;
      if (filterCriteria.sourceUrl !== undefined && kb.sourceUrl !== filterCriteria.sourceUrl) return false;
      if (filterCriteria.taskId !== undefined && kb.taskId !== filterCriteria.taskId) return false;
      if (filterCriteria.uploadedBy !== undefined && kb.uploadedBy !== filterCriteria.uploadedBy) return false;
      if (filterCriteria.title !== undefined && kb.title !== filterCriteria.title) return false;
      if (filterCriteria.description !== undefined && kb.description !== filterCriteria.description) return false;
      if (filterCriteria.itemExternalId !== undefined && kb.itemExternalId !== filterCriteria.itemExternalId) return false;
      if (filterCriteria.includeImg !== undefined && kb.includeImg !== filterCriteria.includeImg) return false;
      if (filterCriteria.includeDoc !== undefined && kb.includeDoc !== filterCriteria.includeDoc) return false;
      if (filterCriteria.fileType !== undefined && kb.fileType !== filterCriteria.fileType) return false;
      if (filterCriteria.fileSize !== undefined && kb.fileSize !== filterCriteria.fileSize) return false;
      if (filterCriteria.isActive !== undefined && kb.isActive !== filterCriteria.isActive) return false;
      if (filterCriteria.status !== undefined && kb.status !== filterCriteria.status) return false;
      if (filterCriteria.processingError !== undefined && kb.processingError !== filterCriteria.processingError) return false;
      if (filterCriteria.contentHash !== undefined && kb.contentHash !== filterCriteria.contentHash) return false;
      if (filterCriteria.frequency !== undefined && kb.frequency !== filterCriteria.frequency) return false;
      if (filterCriteria.chunkCount !== undefined && kb.chunkCount !== filterCriteria.chunkCount) return false;
      if (filterCriteria.department !== undefined && kb.department !== filterCriteria.department) return false;
      return true;
    });

    // Prepare update object with only defined fields
    const updates: Record<string, any> = {};
    if (updateFields.title !== undefined) updates.title = updateFields.title;
    if (updateFields.description !== undefined) updates.description = updateFields.description;
    if (updateFields.taskId !== undefined) updates.taskId = updateFields.taskId;
    if (updateFields.sourceUrl !== undefined) updates.sourceUrl = updateFields.sourceUrl;
    if (updateFields.department !== undefined) updates.department = updateFields.department;
    if (updateFields.organizationId !== undefined) updates.organizationId = updateFields.organizationId;
    if (updateFields.itemExternalId !== undefined) updates.itemExternalId = updateFields.itemExternalId;
    if (updateFields.includeImg !== undefined) updates.includeImg = updateFields.includeImg;
    if (updateFields.includeDoc !== undefined) updates.includeDoc = updateFields.includeDoc;
    if (updateFields.assistantId !== undefined) updates.assistantId = updateFields.assistantId;
    if (updateFields.fileType !== undefined) updates.fileType = updateFields.fileType;
    if (updateFields.fileSize !== undefined) updates.fileSize = updateFields.fileSize;
    if (updateFields.uploadedBy !== undefined) updates.uploadedBy = updateFields.uploadedBy;
    if (updateFields.isActive !== undefined) updates.isActive = updateFields.isActive;
    if (updateFields.status !== undefined) updates.status = updateFields.status;
    if (updateFields.processingError !== undefined) updates.processingError = updateFields.processingError;
    if (updateFields.contentHash !== undefined) updates.contentHash = updateFields.contentHash;
    if (updateFields.frequency !== undefined) updates.frequency = updateFields.frequency;
    if (updateFields.chunkCount !== undefined) updates.chunkCount = updateFields.chunkCount;
    if (updateFields.metadata !== undefined) updates.metadata = updateFields.metadata;
    if (updateFields.createdAt !== undefined) updates.createdAt = updateFields.createdAt;
    if (updateFields.updatedAt !== undefined) updates.updatedAt = updateFields.updatedAt;
    
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

