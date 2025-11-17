import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getWidgetSettings = query({
  args: { organizationId: v.string() },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .unique();
  },
});

export const saveWidgetSettings = mutation({
  args: {
    organizationId: v.string(),
    logoUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    welcomeTitle: v.optional(v.string()),
    welcomeDescription: v.optional(v.string()),
    aiNotice: v.optional(v.string()),
    privacyPolicyText: v.optional(v.string()),
    faqTitle: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    mutedTextColor: v.optional(v.string()),
    borderColor: v.optional(v.string()),
    buttonBackgroundColor: v.optional(v.string()),
    faqs: v.optional(
      v.array(
        v.object({
          id: v.string(),
          question: v.string(),
          answer: v.optional(v.string()),
        })
      )
    ),
    enabledDepartments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .unique();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, args);
    } else {
      await ctx.db.insert("widgetSettings", args);
    }
  },
});
