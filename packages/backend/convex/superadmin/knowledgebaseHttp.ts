import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import { ConvexError } from "convex/values";
import { handleError, validateRequiredFields } from "./httpHelpers";

// GET /api/superadmin/knowledgebase - Get knowledge base entries with filters
export const getKnowledgebase = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const assistantId = url.searchParams.get("assistantId");
    const organizationId = url.searchParams.get("organizationId");
    const sourceUrl = url.searchParams.get("sourceUrl");
    const status = url.searchParams.get("status");
    const uploadedBy = url.searchParams.get("uploadedBy");
    const fileType = url.searchParams.get("fileType");
    const isActive = url.searchParams.get("isActive");
    const frequency = url.searchParams.get("frequency");
    const department = url.searchParams.get("department");
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    let result;

    // Single record by ID
    if (id) {
      result = await ctx.runQuery(api.superadmin.knowledgebase.getKnowledgeBaseById, {
        id: id as any,
      });
    }
    // Pagination
    else if (page || limit) {
      const paginationOpts = {
        numItems: limit ? parseInt(limit) : 10,
        cursor: undefined,
      };
      
      const queryArgs: any = { paginationOpts };
      if (assistantId) queryArgs.assistantId = assistantId as any;
      if (status) queryArgs.status = status as any;

      result = await ctx.runQuery(api.superadmin.knowledgebase.getKnowledgeBasesWithPagination, queryArgs);
    }
    // Filter by multiple criteria
    else if (assistantId || organizationId || sourceUrl || status || uploadedBy || fileType || isActive || frequency || department) {
      const filterArgs: any = {};
      if (assistantId) filterArgs.assistantId = assistantId as any;
      if (organizationId) filterArgs.organizationId = organizationId;
      if (sourceUrl) filterArgs.sourceUrl = sourceUrl;
      if (status) filterArgs.status = status as any;
      if (uploadedBy) filterArgs.uploadedBy = uploadedBy;
      if (fileType) filterArgs.fileType = fileType as any;
      if (isActive !== null) filterArgs.isActive = isActive === "true";
      if (frequency) filterArgs.frequency = frequency as any;
      if (department) filterArgs.department = department;

      result = await ctx.runQuery(api.superadmin.knowledgebase.getKnowledgeBasesWithFilters, filterArgs);
    }
    // Get all
    else {
      result = await ctx.runQuery(api.superadmin.knowledgebase.getAllKnowledgeBases);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
});

// POST /api/superadmin/knowledgebase - Create knowledge base entries
export const createKnowledgebase = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ["title", "taskId", "sourceUrl", "assistantId", "fileType", "uploadedBy"]);

    // Build the mutation arguments, only including defined values
    const createArgs: any = {
      title: body.title,
      taskId: body.taskId,
      sourceUrl: body.sourceUrl,
      assistantId: body.assistantId,
      fileType: body.fileType,
      uploadedBy: body.uploadedBy,
    };

    // Add optional fields only if they are defined
    if (body.description !== undefined) createArgs.description = body.description;
    if (body.organizationId !== undefined) createArgs.organizationId = body.organizationId;
    if (body.fileSize !== undefined) createArgs.fileSize = body.fileSize;
    if (body.isActive !== undefined) createArgs.isActive = body.isActive;
    if (body.status !== undefined) createArgs.status = body.status;
    if (body.processingError !== undefined) createArgs.processingError = body.processingError;
    if (body.contentHash !== undefined) createArgs.contentHash = body.contentHash;
    if (body.frequency !== undefined) createArgs.frequency = body.frequency;
    if (body.chunkCount !== undefined) createArgs.chunkCount = body.chunkCount;
    if (body.itemExternalId !== undefined) createArgs.itemExternalId = body.itemExternalId;
    if (body.includeImg !== undefined) createArgs.includeImg = body.includeImg;
    if (body.includeDoc !== undefined) createArgs.includeDoc = body.includeDoc;
    if (body.metadata !== undefined) createArgs.metadata = body.metadata;
    if (body.createdAt !== undefined) createArgs.createdAt = body.createdAt;
    if (body.updatedAt !== undefined) createArgs.updatedAt = body.updatedAt;

    const result = await ctx.runMutation(api.superadmin.knowledgebase.createKnowledgeBase, createArgs);

    return new Response(
      JSON.stringify({
        success: true,
        data: { id: result },
        message: "Knowledge base entry created successfully",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
});

// PUT /api/superadmin/knowledgebase - Update knowledge base entries
export const updateKnowledgebase = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // New structured format with filterCriteria and updateFields
    if (body.filterCriteria && body.updateFields) {
      const { filterCriteria, updateFields } = body;

      const result = await ctx.runMutation(api.superadmin.knowledgebase.updateKnowledgeBaseByFilter, {
        filterCriteria,
        updateFields,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.updatedCount} knowledge base entries updated successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Legacy: Update by ID
    else if (body.id) {
      validateRequiredFields(body, ["id"]);

      const updateArgs: any = { id: body.id };
      if (body.title !== undefined) updateArgs.title = body.title;
      if (body.description !== undefined) updateArgs.description = body.description;
      if (body.taskId !== undefined) updateArgs.taskId = body.taskId;
      if (body.sourceUrl !== undefined) updateArgs.sourceUrl = body.sourceUrl;
      if (body.department !== undefined) updateArgs.department = body.department;
      if (body.organizationId !== undefined) updateArgs.organizationId = body.organizationId;
      if (body.itemExternalId !== undefined) updateArgs.itemExternalId = body.itemExternalId;
      if (body.includeImg !== undefined) updateArgs.includeImg = body.includeImg;
      if (body.includeDoc !== undefined) updateArgs.includeDoc = body.includeDoc;
      if (body.assistantId !== undefined) updateArgs.assistantId = body.assistantId;
      if (body.fileType !== undefined) updateArgs.fileType = body.fileType;
      if (body.fileSize !== undefined) updateArgs.fileSize = body.fileSize;
      if (body.uploadedBy !== undefined) updateArgs.uploadedBy = body.uploadedBy;
      if (body.isActive !== undefined) updateArgs.isActive = body.isActive;
      if (body.status !== undefined) updateArgs.status = body.status;
      if (body.processingError !== undefined) updateArgs.processingError = body.processingError;
      if (body.contentHash !== undefined) updateArgs.contentHash = body.contentHash;
      if (body.frequency !== undefined) updateArgs.frequency = body.frequency;
      if (body.chunkCount !== undefined) updateArgs.chunkCount = body.chunkCount;
      if (body.metadata !== undefined) updateArgs.metadata = body.metadata;
      if (body.createdAt !== undefined) updateArgs.createdAt = body.createdAt;
      if (body.updatedAt !== undefined) updateArgs.updatedAt = body.updatedAt;

      const result = await ctx.runMutation(api.superadmin.knowledgebase.updateKnowledgeBase, updateArgs);

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Knowledge base entry updated successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Update status only (common operation)
    else if (body.id && body.status && Object.keys(body).length <= 4) {
      const result = await ctx.runMutation(api.superadmin.knowledgebase.updateKnowledgeBaseStatus, {
        id: body.id,
        status: body.status,
        processingError: body.processingError,
        chunkCount: body.chunkCount,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Knowledge base status updated successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    else {
      throw new ConvexError("Either 'filterCriteria' with 'updateFields' or 'id' is required for update");
    }
  } catch (error: unknown) {
    return handleError(error);
  }
});

// DELETE /api/superadmin/knowledgebase - Delete knowledge base entries
export const deleteKnowledgebase = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // Delete by ID
    if (body.id) {
      const result = await ctx.runMutation(api.superadmin.knowledgebase.deleteKnowledgeBase, {
        id: body.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Knowledge base entry deleted successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Soft delete by ID
    else if (body.id && body.soft === true) {
      const result = await ctx.runMutation(api.superadmin.knowledgebase.softDeleteKnowledgeBase, {
        id: body.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Knowledge base entry soft deleted successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Delete by assistantId
    else if (body.assistantId) {
      const result = await ctx.runMutation(api.superadmin.knowledgebase.deleteKnowledgeBasesByAssistantId, {
        assistantId: body.assistantId,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.deletedCount} knowledge base entries deleted successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    else {
      throw new ConvexError("Either 'id' or 'assistantId' is required for delete. Use 'soft: true' for soft delete.");
    }
  } catch (error: unknown) {
    return handleError(error);
  }
});