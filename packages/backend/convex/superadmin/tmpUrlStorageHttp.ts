import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import { ConvexError } from "convex/values";
import { handleError } from "./httpHelpers";

// GET /api/superadmin/tmp-url-storage - Get records with filters
export const getTmpUrlStorage = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");
    const status = url.searchParams.get("status");
    const taskId = url.searchParams.get("taskId");
    const sourceUrl = url.searchParams.get("sourceUrl");
    const id = url.searchParams.get("id");

    let result;

    // Single record by ID (highest priority)
    if (id) {
      result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getUrlStorageById, {
        id: id as any,
      });
    }
    // If any of the main filter params are present, use the flexible AND-query
    else if (taskId !== null || sourceUrl !== null || status !== null) {
      // Build filter criteria only from provided params
      const hasTask = taskId !== null && taskId !== undefined && taskId !== "";
      const hasSource = sourceUrl !== null && sourceUrl !== undefined && sourceUrl !== "";
      const hasStatus = status !== null && status !== undefined && status !== "";

      // If none provided, fallthrough to pagination / getAll
      if (hasTask || hasSource || hasStatus) {
        const filterCriteria: any = {};
        if (hasTask) filterCriteria.taskId = taskId;
        if (hasSource) filterCriteria.sourceUrl = sourceUrl;
        if (hasStatus) filterCriteria.status = status === "true";

        result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getUrlStorageByMultipleFilters, filterCriteria);
      } else if (page || limit) {
        // Pagination
        result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getUrlStorageWithPagination, {
          page: page ? parseInt(page) : undefined,
          limit: limit ? parseInt(limit) : undefined,
        });
      } else {
        result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getAllUrlStorage);
      }
    }
    // Pagination (fallback when no filters)
    else if (page || limit) {
      result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getUrlStorageWithPagination, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
    }
    // Get all
    else {
      result = await ctx.runQuery(api.superadmin.tmpUrlStorage.getAllUrlStorage);
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

// POST /api/superadmin/tmp-url-storage - Create records
export const createTmpUrlStorage = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // Bulk creation
    if (body.records && Array.isArray(body.records)) {
      // No validation needed since all fields are optional and can be duplicated
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.createMultipleUrlStorage, {
        records: body.records,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.created} records created successfully`,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Single creation
    else {
      // All fields are optional, no validation required
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.createUrlStorage, {
        sourceUrl: body.sourceUrl,
        taskId: body.taskId,
        status: body.status,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: { id: result },
          message: "Record created successfully",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: unknown) {
    return handleError(error);
  }
});

// PUT /api/superadmin/tmp-url-storage - Update records
export const updateTmpUrlStorage = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // New structured format with filterCriteria and updateFields
    if (body.filterCriteria && body.updateFields) {
      const { filterCriteria, updateFields } = body;

      // Call new mutation function to update by filter criteria
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.updateUrlStorageByFilterCriteria, {
        filterCriteria,
        updateFields,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.updated} records updated successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Legacy: Update by ID
    else if (body.id) {
      const updateData: any = { id: body.id };
      if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
      if (body.taskId !== undefined) updateData.taskId = body.taskId;
      if (body.status !== undefined) updateData.status = body.status;

      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.updateUrlStorageById, updateData);

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Record updated successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Legacy: Update by task_id (status only or multiple fields)
    else if (body.task_id) {
      // Update status only
      if (body.status !== undefined && Object.keys(body).length === 2) {
        const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.updateStatusByTaskId, {
          taskId: body.task_id,
          status: body.status,
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: result,
            message: `${result.updated} records status updated successfully`,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Update multiple fields by task_id
      else {
        const updateData: any = { task_id: body.task_id };
        if (body.source_url !== undefined) updateData.source_url = body.source_url;
        if (body.status !== undefined) updateData.status = body.status;

        const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.updateUrlStorageByTaskId, updateData);

        return new Response(
          JSON.stringify({
            success: true,
            data: result,
            message: `${result.updated} records updated successfully`,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    else {
      throw new ConvexError("Either 'filterCriteria' with 'updateFields', 'id', or 'task_id' is required for update");
    }
  } catch (error: unknown) {
    return handleError(error);
  }
});

// DELETE /api/superadmin/tmp-url-storage - Delete records
export const deleteTmpUrlStorage = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    // Delete by ID
    if (body.id) {
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.deleteUrlStorageById, {
        id: body.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: "Record deleted successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Delete by task_id
    else if (body.task_id) {
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.deleteUrlStorageByTaskId, {
        taskId: body.task_id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.deleted} records deleted successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Delete by status
    else if (body.status !== undefined) {
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.deleteUrlStorageByStatus, {
        status: body.status,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: `${result.deleted} records deleted successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Delete all records (dangerous operation)
    else if (body.confirm === true) {
      const result = await ctx.runMutation(api.superadmin.tmpUrlStorage.deleteAllUrlStorage, {
        confirm: body.confirm,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          message: result.deleted > 0 ? `${result.deleted} records deleted successfully` : "No records to delete",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    else {
      throw new ConvexError("Either 'id', 'task_id', 'status', or 'confirm: true' is required for delete");
    }
  } catch (error: unknown) {
    return handleError(error);
  }
});