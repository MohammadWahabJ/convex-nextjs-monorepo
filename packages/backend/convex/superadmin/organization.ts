// @ts-nocheck
import { v } from "convex/values";
import { action, mutation, internalMutation, internalQuery, query } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { ConvexError } from "convex/values";
import { internal, api } from "../_generated/api";

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Action to create a new organization
export const createOrganization = action({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    collectionName: v.string(),
    countryCode: v.string(), // Country code string
    promptTemplete: v.string(),
    maxAllowedMemberships: v.optional(v.number()), // ✅ added field
    helpDesk: v.boolean(),
    websiteLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // // Check user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    try {
      const organization = await clerk.organizations.createOrganization({
        name: args.name,
        slug: args.slug,
        publicMetadata: {
          countryCode: args.countryCode,
        },
        createdBy: identity.subject, // ✅ include creator from identity
        maxAllowedMemberships: args.maxAllowedMemberships ?? 10, // ✅ added property
      });

      // If organization creation is successful, insert into municipalityDbAndPromptTemplate table
      try {
        await ctx.runMutation(internal.superadmin.organization.insertMunicipalityData, {
          municipalityId: organization.id,
          collectionName: args.collectionName,
          promptTemplate: args.promptTemplete,
          municipalityName: args.name,
          countryCode: args.countryCode,
          helpDesk: args.helpDesk,
          websiteLink: args.websiteLink,
        });

        // Create default assistant for the organization
        try {
          await ctx.runMutation(api.superadmin.assistant.createAssistant, {
            organizationId: organization.id,
            name: "General",
            prompt: args.promptTemplete,
            type: "private",
            model: "gpt-4",
            vectorStoreId: args.collectionName,
            isActive: true,
            temperature: 0.7,
            maxTokens: 2000,
            maxSteps: 10,
            createdBy: identity.subject, // Add the user ID who created the organization
            countryCode: args.countryCode, // Add country code
            baseSystemPrompt: `You are a helpful assistant for ${args.name} municipality. Provide accurate and helpful information based on the knowledge base.`,
            starterPrompt: [
              "How can I help you today?",
              "What information are you looking for?",
              "Do you have any questions about our services?"
            ],
            color: "#0066cc",
            settings: {
              enableToolUse: true,
              allowedTools: [],
              maxHistoryMessages: 50,
            },
          });
        } catch (assistantError) {
          console.error("Error creating default assistant:", assistantError);
          // Don't fail the organization creation if assistant creation fails
        }

        return {
          success: true,
          organizationId: organization.id,
          name: organization.name,
          maxAllowedMemberships: args.maxAllowedMemberships ?? 10, // ✅ include in return
          createdBy: identity.subject, // ✅ include creator in response
          helpDesk: args.helpDesk,
          websiteLink: args.websiteLink,
        };
      } catch (dbError) {
        // If database insertion fails, we should clean up the organization
        // For now, we'll just log the error and return failure
        console.error("Error inserting municipality data:", dbError);
        
        // Optionally, you could delete the created organization here
        // await clerk.organizations.deleteOrganization(organization.id);
        
        return {
          success: false,
          error: "Failed to save municipality data to database",
        };
      }
    } catch (error) {
      console.error("Error creating organization in Clerk:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});


// Query to fetch organizations with basic database data (no Clerk integration)
export const getAllOrganizations = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get all municipalities from database
    const allMunicipalities = await ctx.db.query("municipalities").collect();
    
    // Filter by active status (default to true)
    const { activeOnly = true } = args;
    let municipalities = activeOnly 
      ? allMunicipalities.filter((municipality: any) => municipality.isActive === activeOnly)
      : allMunicipalities;

    // Map to organization-like format using database data only
    const organizations = municipalities.map((municipality: any) => ({
      id: municipality.orgId,
      name: municipality.name,
      slug: municipality.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: '', // No Clerk data available in query
      hasImage: false, // No Clerk data available in query
      countryCode: municipality.countryCode,
      isActive: municipality.isActive,
      helpDesk: municipality.helpDesk,
      websiteLink: municipality.websiteLink,
    }));

    return {
      success: true,
      organizations: organizations,
      totalCount: organizations.length,
    };
  },
});

// Query for role-based organization filtering
export const getAllOrganizationsWithRole = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        success: false,
        organizations: [],
        totalCount: 0,
        error: "User not authenticated",
      };
    }

    try {
      const managementRole = identity.managementRole;
      const userCountryCode = identity.countryCode;

      // Get all municipalities from database
      let municipalities = await ctx.db.query("municipalities").collect();
      
      // Filter by active status (default to true)
      const { activeOnly = true } = args;
      if (activeOnly !== undefined) {
        municipalities = municipalities.filter((municipality: any) => municipality.isActive === activeOnly);
      }

      // Apply role-based filtering
      if (managementRole === "moderator" && userCountryCode) {
        // Moderator: only show municipalities matching their countryCode
        municipalities = municipalities.filter((municipality: any) => municipality.countryCode === userCountryCode);
      }
      // Super admin: show all municipalities (no additional filtering needed)

      // Map to organization format using database data only
      const organizations = municipalities.map((municipality: any) => ({
        id: municipality.orgId,
        name: municipality.name,
        slug: municipality.name.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: '', // No Clerk data
        hasImage: false, // No Clerk data
        countryCode: municipality.countryCode,
        isActive: municipality.isActive,
        helpDesk: municipality.helpDesk,
        websiteLink: municipality.websiteLink,
      }));

      return {
        success: true,
        organizations: organizations,
        totalCount: organizations.length,
      };
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return {
        success: false,
        organizations: [],
        totalCount: 0,
        error: error instanceof Error ? error.message : "Failed to fetch organizations",
      };
    }
  },
});

// Note: getCurrentUserRole action has been removed as role fetching is now handled internally in getAllOrganizationsWithRole

// Query to get municipalities with basic filtering (pure Convex data)
export const getMunicipalitiesByRole = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx: any, args: any) => {
    const { activeOnly = true } = args;
    let municipalities = await ctx.db.query("municipalities").collect();
    
    if (activeOnly !== undefined) {
      municipalities = municipalities.filter((municipality: any) => municipality.isActive === activeOnly);
    }

    // Map to organization-like format
    const organizations = municipalities.map((municipality: any) => ({
      id: municipality.orgId,
      name: municipality.name,
      slug: municipality.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: '',
      hasImage: false,
      countryCode: municipality.countryCode,
      isActive: municipality.isActive,
      helpDesk: municipality.helpDesk,
      websiteLink: municipality.websiteLink,
    }));

    return {
      success: true,
      organizations,
      totalCount: organizations.length,
    };
  },
});
// Action to fetch organization details by ID or slug
export const getOrganizationDetails = action({
    args: {
        organizationId: v.string(),
        slug: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check user authentication
        // const identity = await ctx.auth.getUserIdentity();
        // if (identity === null) {
        //   throw new ConvexError({
        //     code: "UNAUTHORIZED",
        //     message: "Identity not found",
        //   });
        // }

        try {
            const organization = await clerk.organizations.getOrganization({
                organizationId: args.organizationId,
                slug: args.slug ?? "",
            });

            // Extract relevant fields and ensure they are of supported types
            const { id, name, slug, imageUrl, hasImage } = organization;
            return {
                success: true,
                organization: {
                    id,
                    name,
                    slug,
                    imageUrl,
                    hasImage,
                },
            };
        } catch (error) {
            console.error("Error fetching organization details from Clerk:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },
});



export const deleteOrganizationById = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Delete from Convex database first
      await ctx.runMutation(internal.superadmin.organization.deleteMunicipalityByOrgId, {
        orgId: args.organizationId,
      });

      // Delete from Clerk
      await clerk.organizations.deleteOrganization(args.organizationId);

      return {
        success: true,
        organizationId: args.organizationId,
      };
    } catch (error) {
      console.error("Error deleting organization:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete organization",
      };
    }
  },
});

// Internal mutation to delete municipality by orgId
export const deleteMunicipalityByOrgId = internalMutation({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the new by_orgId index to find the municipality
    const municipality = await ctx.db
      .query("municipalities")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (!municipality) {
      throw new ConvexError("Municipality not found in database");
    }

    // Delete the municipality
    await ctx.db.delete(municipality._id);
  },
});

// Internal mutation to insert municipality data
export const insertMunicipalityData = internalMutation({
  args: {
    municipalityId: v.string(),
    collectionName: v.string(),
    promptTemplate: v.string(),
    municipalityName: v.string(),
    countryCode: v.string(),
    helpDesk: v.boolean(),
    websiteLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      

      // Insert into municipalities table
      const municipalityId = await ctx.db.insert("municipalities", {
        orgId: args.municipalityId, // Organization ID from Clerk
        name: args.municipalityName,
        countryCode: args.countryCode, // Country code as string
        collectionName: args.collectionName,
        promptTemplate: args.promptTemplate,
        isActive: true, // Default to active
        helpDesk: args.helpDesk,
        websiteLink: args.websiteLink,
      });

      return {
        success: true,
        municipalityId,
      };
    } catch (error) {
      console.error("Error inserting municipality data:", error);
      throw new ConvexError({
        code: "DATABASE_ERROR",
        message: "Failed to insert municipality data",
      });
    }
  },
});

// Query to get organizations by country code with role-based filtering
export const getOrganizationsByCountry = query({
  args: {
    countryCode: v.string(),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        success: false,
        organizations: [],
        totalCount: 0,
        error: "User not authenticated",
      };
    }

    try {
      const managementRole = identity.managementRole;
      const userCountryCode = identity.countryCode;

      // Get municipalities from database
      let municipalities = await ctx.db.query("municipalities")
        .filter((q) => q.eq(q.field("countryCode"), args.countryCode))
        .collect();
      
      // Filter by active status (default to true)
      const { activeOnly = true } = args;
      if (activeOnly !== undefined) {
        municipalities = municipalities.filter((municipality: any) => municipality.isActive === activeOnly);
      }

      // Apply role-based filtering
      if (managementRole === "moderator" && userCountryCode) {
        // Moderator: only show municipalities matching their countryCode
        if (args.countryCode !== userCountryCode) {
          return {
            success: false,
            organizations: [],
            totalCount: 0,
            error: "Access denied: cannot view organizations from other countries",
          };
        }
      }
      // Super admin: can view all countries

      // Map to organization format using database data only
      const organizations = municipalities.map((municipality: any) => ({
        id: municipality.orgId,
        name: municipality.name,
        slug: municipality.name.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: '', // No Clerk data
        hasImage: false, // No Clerk data
        countryCode: municipality.countryCode,
        isActive: municipality.isActive,
        helpDesk: municipality.helpDesk,
        websiteLink: municipality.websiteLink,
      }));

      return {
        success: true,
        organizations: organizations,
        totalCount: organizations.length,
      };
    } catch (error) {
      console.error("Error fetching organizations by country:", error);
      return {
        success: false,
        organizations: [],
        totalCount: 0,
        error: error instanceof Error ? error.message : "Failed to fetch organizations",
      };
    }
  },
});
