import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserAuthenticated } from "../helper";


export const getAllDepartments = query({
    args: {},
    handler: async (ctx, args) => {
        return await ctx.db
                .query("assistants")
                .filter(q => q.eq(q.field("type"), "private"))
                .collect();
    },
});

