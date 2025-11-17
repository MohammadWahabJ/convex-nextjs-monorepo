// @ts-nocheck
import { v } from "convex/values";
import { action, query, internalQuery, ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { createClerkClient } from "@clerk/backend";

// Define Country interface
interface Country {
  _id: string;
  name: string;
  code: string;
  shortName?: string;
  isActive: boolean;
}

// Define return type for country list action
interface CountryListResponse {
  success: boolean;
  countries: Country[];
  totalCount: number;
  error?: string;
}

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Query to get all countries with role-based filtering
export const getAllCountries = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        success: false,
        countries: [],
        totalCount: 0,
        error: "User not authenticated",
      };
    }

    try {
      // Get user metadata from Clerk 
    
      const managementRole = identity.managementRole;
      const userCountryCode = identity.countryCode;

      // console.log(managementRole,userCountryCode);

      // Check role and apply appropriate filtering
      if (managementRole === "super_admin") {
        // Super admin: return all countries
        return await ctx.db.query("countryCodes").collect();
      } else if (managementRole === "moderator" && userCountryCode) {
        // Moderator: filter by matching country code using by_code index
        return await ctx.db
          .query("countryCodes")
          .withIndex("by_code", (q) => q.eq("code", userCountryCode))
          .collect();
      } else {
        // No valid role or missing country code for moderator
        return [];
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  },
});

