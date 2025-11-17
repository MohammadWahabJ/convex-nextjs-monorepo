import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";

// Mutation to create a new department (now creates a private assistant)
export const createDepartment = mutation({
  args: {
    name: v.string(),
    details: v.optional(v.string()),
    organizationId: v.string(),
    model: v.string(),
    starterPrompt: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check user authentication
    // await checkUserAuthenticated(ctx);

    // Check if department with this name already exists for this organization
    const existingDepartment = await ctx.db
      .query("assistants")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "private"),
          q.eq(q.field("name"), args.name)
        )
      )
      .first();

    if (existingDepartment) {
      throw new ConvexError("Department with this name already exists");
    }

    // Get the "General" assistant for this organization to use as template
    const generalAssistant = await ctx.db
      .query("assistants")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("name"), "General"))
      .first();

    if (!generalAssistant) {
      throw new ConvexError(
        "General assistant not found for this organization"
      );
    }

    // Create new private assistant (department) based on General assistant template
    const id = await ctx.db.insert("assistants", {
      organizationId: args.organizationId,
      name: args.name,
      prompt: args.details || generalAssistant.prompt, // Use details as prompt or fallback to General's prompt
      model: args.model,
      baseSystemPrompt: generalAssistant.baseSystemPrompt,
      starterPrompt: args.starterPrompt || generalAssistant.starterPrompt,
      type: "private", // This makes it a department
      temperature: generalAssistant.temperature,
      maxTokens: generalAssistant.maxTokens,
      maxSteps: generalAssistant.maxSteps,
      isActive: true,
      color: generalAssistant.color,
      vectorStoreId: generalAssistant.vectorStoreId,
      description: generalAssistant.description,
      countryCode: generalAssistant.countryCode,
      createdBy: generalAssistant.createdBy,
      settings: generalAssistant.settings,
    });

    return id;
  },
});

// Query to get all departments (now from assistants table with type "private")
export const getAllDepartments = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch private assistants for the organization (these are now departments)
    return await ctx.db
      .query("assistants")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("type"), "private"))
      .collect();
  },
});

// Query to get department by ID
export const getDepartmentById = query({
  args: {
    id: v.id("assistants"),
  },
  handler: async (ctx, args) => {
    // Check user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    return await ctx.db.get(args.id);
  },
});

// Mutation to update a department (updates assistant name and prompt)
export const updateDepartment = mutation({
  args: {
    id: v.id("assistants"),
    name: v.string(),
    details: v.optional(v.string()),
    model: v.string(),
    starterPrompt: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    // Get the existing department
    const existingDepartment = await ctx.db.get(args.id);
    if (!existingDepartment) {
      throw new ConvexError("Department not found");
    }

    // Check if it's a private assistant (department)
    if (existingDepartment.type !== "private") {
      throw new ConvexError("Only departments can be updated through this endpoint");
    }

    // Check if another department with the same name exists in the same organization
    if (args.name !== existingDepartment.name) {
      const duplicateDepartment = await ctx.db
        .query("assistants")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", existingDepartment.organizationId!)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "private"),
            q.eq(q.field("name"), args.name)
          )
        )
        .first();

      if (duplicateDepartment && duplicateDepartment._id !== args.id) {
        throw new ConvexError("Department with this name already exists");
      }
    }

    // Update the department
    await ctx.db.patch(args.id, {
      name: args.name,
      prompt: args.details || existingDepartment.prompt,
      model: args.model,
      starterPrompt: args.starterPrompt || existingDepartment.starterPrompt,
    });

    return args.id;
  },
});
