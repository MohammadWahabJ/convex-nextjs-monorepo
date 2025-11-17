import { v, ConvexError } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";

// ===============================
// QUERY OPERATIONS (SELECT)
// ===============================

// Get all records
export const getAllUrlStorage = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("temporaryUrlStorage").collect();
  },
});

// Get a single record by ID
export const getUrlStorageById = query({
  args: { id: v.id("temporaryUrlStorage") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new ConvexError("Record not found");
    }
    return record;
  },
});

// Get records by taskId
export const getUrlStorageByTaskId = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();
  },
});

// Get records by status
export const getUrlStorageByStatus = query({
  args: { status: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

// Get records by sourceUrl
export const getUrlStorageBySourceUrl = query({
  args: { sourceUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("sourceUrl"), args.sourceUrl))
      .collect();
  },
});

// Get records with pagination
export const getUrlStorageWithPagination = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const offset = (page - 1) * limit;

    const allRecords = await ctx.db.query("temporaryUrlStorage").collect();
    const totalCount = allRecords.length;
    const paginatedRecords = allRecords.slice(offset, offset + limit);

    return {
      data: paginatedRecords,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1,
      },
    };
  },
});

// Get records by multiple filters (AND logic - all must match)
export const getUrlStorageByMultipleFilters = query({
  args: {
    taskId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Build filter conditions dynamically
    let query = ctx.db.query("temporaryUrlStorage");
    
    // Apply filters step by step to match ALL provided criteria (AND logic)
    if (args.taskId !== undefined) {
      query = query.filter((q) => q.eq(q.field("taskId"), args.taskId));
    }
    if (args.sourceUrl !== undefined) {
      query = query.filter((q) => q.eq(q.field("sourceUrl"), args.sourceUrl));
    }
    if (args.status !== undefined) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const records = await query.collect();
    return records;
  },
});

// ===============================
// MUTATION OPERATIONS (INSERT, UPDATE, DELETE)
// ===============================

// Create a new record (INSERT)
export const createUrlStorage = mutation({
  args: {
    sourceUrl: v.optional(v.string()),
    taskId: v.optional(v.string()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // No duplicate validation - allow all combinations including duplicates
    const recordId = await ctx.db.insert("temporaryUrlStorage", {
      sourceUrl: args.sourceUrl,
      taskId: args.taskId,
      status: args.status,
      createdAt: Date.now(),
    });

    return recordId;
  },
});

// Create multiple records (BULK INSERT)
export const createMultipleUrlStorage = mutation({
  args: {
    records: v.array(
      v.object({
        sourceUrl: v.optional(v.string()),
        taskId: v.optional(v.string()),
        status: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const createdIds = [];
    
    for (const record of args.records) {
      // No duplicate validation - allow all combinations including duplicates
      const recordId = await ctx.db.insert("temporaryUrlStorage", {
        ...record,
        createdAt: Date.now(),
      });
      createdIds.push(recordId);
    }

    return {
      created: createdIds.length,
      recordIds: createdIds,
    };
  },
});

// Update a record by ID (UPDATE)
export const updateUrlStorageById = mutation({
  args: {
    id: v.id("temporaryUrlStorage"),
    sourceUrl: v.optional(v.string()),
    taskId: v.optional(v.string()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    // Check if record exists
    const existingRecord = await ctx.db.get(id);
    if (!existingRecord) {
      throw new ConvexError("Record not found");
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new ConvexError("No valid fields to update");
    }

    await ctx.db.patch(id, cleanUpdateData);
    
    return await ctx.db.get(id);
  },
});

// Update records by filter criteria (flexible filtering)
export const updateUrlStorageByFilterCriteria = mutation({
  args: {
    filterCriteria: v.object({
      sourceUrl: v.optional(v.string()),
      taskId: v.optional(v.string()),
      status: v.optional(v.boolean()),
    }),
    updateFields: v.object({
      sourceUrl: v.optional(v.string()),
      taskId: v.optional(v.string()),
      status: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const { filterCriteria, updateFields } = args;
    
    // Remove undefined values from updateFields
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new ConvexError("No valid fields to update");
    }

    // Build filter conditions dynamically
    let query = ctx.db.query("temporaryUrlStorage");
    
    // Apply filters step by step to avoid type inference issues
    if (filterCriteria.sourceUrl !== undefined) {
      query = query.filter((q) => q.eq(q.field("sourceUrl"), filterCriteria.sourceUrl));
    }
    if (filterCriteria.taskId !== undefined) {
      query = query.filter((q) => q.eq(q.field("taskId"), filterCriteria.taskId));
    }
    if (filterCriteria.status !== undefined) {
      query = query.filter((q) => q.eq(q.field("status"), filterCriteria.status));
    }

    const records = await query.collect();

    if (records.length === 0) {
      throw new ConvexError("No records found matching the filter criteria");
    }

    const updatedIds = [];
    for (const record of records) {
      await ctx.db.patch(record._id, cleanUpdateData);
      updatedIds.push(record._id);
    }

    return {
      updated: updatedIds.length,
      recordIds: updatedIds,
      matchedRecords: records.length,
    };
  },
});

// Update records by taskId (UPDATE multiple)
export const updateUrlStorageByTaskId = mutation({
  args: {
    taskId: v.string(),
    sourceUrl: v.optional(v.string()),
    status: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updateData } = args;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new ConvexError("No valid fields to update");
    }

    const records = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("taskId"), taskId))
      .collect();

    if (records.length === 0) {
      throw new ConvexError("No records found with the specified taskId");
    }

    const updatedIds = [];
    for (const record of records) {
      await ctx.db.patch(record._id, cleanUpdateData);
      updatedIds.push(record._id);
    }

    return {
      updated: updatedIds.length,
      recordIds: updatedIds,
    };
  },
});

// Update status by taskId (specific common operation)
export const updateStatusByTaskId = mutation({
  args: {
    taskId: v.string(),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();

    if (records.length === 0) {
      throw new ConvexError("No records found with the specified taskId");
    }

    const updatedIds = [];
    for (const record of records) {
      await ctx.db.patch(record._id, { status: args.status });
      updatedIds.push(record._id);
    }

    return {
      updated: updatedIds.length,
      recordIds: updatedIds,
    };
  },
});

// Delete a record by ID (DELETE)
export const deleteUrlStorageById = mutation({
  args: { id: v.id("temporaryUrlStorage") },
  handler: async (ctx, args) => {
    // Check if record exists
    const existingRecord = await ctx.db.get(args.id);
    if (!existingRecord) {
      throw new ConvexError("Record not found");
    }

    await ctx.db.delete(args.id);
    return { success: true, deletedId: args.id };
  },
});

// Delete records by taskId (DELETE multiple)
export const deleteUrlStorageByTaskId = mutation({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();

    if (records.length === 0) {
      throw new ConvexError("No records found with the specified taskId");
    }

    const deletedIds = [];
    for (const record of records) {
      await ctx.db.delete(record._id);
      deletedIds.push(record._id);
    }

    return {
      deleted: deletedIds.length,
      deletedIds,
    };
  },
});

// Delete records by status (DELETE multiple)
export const deleteUrlStorageByStatus = mutation({
  args: { status: v.boolean() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();

    if (records.length === 0) {
      throw new ConvexError("No records found with the specified status");
    }

    const deletedIds = [];
    for (const record of records) {
      await ctx.db.delete(record._id);
      deletedIds.push(record._id);
    }

    return {
      deleted: deletedIds.length,
      deletedIds,
    };
  },
});

// Delete all records (DELETE ALL - use with caution)
export const deleteAllUrlStorage = mutation({
  args: { confirm: v.boolean() },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new ConvexError("Please set confirm to true to delete all records");
    }

    const allRecords = await ctx.db.query("temporaryUrlStorage").collect();
    
    if (allRecords.length === 0) {
      return { deleted: 0, message: "No records to delete" };
    }

    const deletedIds = [];
    for (const record of allRecords) {
      await ctx.db.delete(record._id);
      deletedIds.push(record._id);
    }

    return {
      deleted: deletedIds.length,
      deletedIds,
    };
  },
});

// ===============================
// UTILITY OPERATIONS
// ===============================

// Count records
export const countUrlStorage = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("temporaryUrlStorage").collect();
    return records.length;
  },
});

// Count records by status
export const countUrlStorageByStatus = query({
  args: { status: v.boolean() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
    return records.length;
  },
});

// Check if record exists
export const checkUrlStorageExists = query({
  args: {
    taskId: v.string(),
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("temporaryUrlStorage")
      .filter((q) => 
        q.and(
          q.eq(q.field("taskId"), args.taskId),
          q.eq(q.field("sourceUrl"), args.sourceUrl)
        )
      )
      .first();

    return { exists: !!record, record: record || null };
  },
});
