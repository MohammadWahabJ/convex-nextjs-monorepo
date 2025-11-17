import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  widgetSettings: defineTable({
    organizationId: v.string(),
    logoUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    welcomeTitle: v.optional(v.string()),
    welcomeDescription: v.optional(v.string()),
    aiNotice: v.optional(v.string()),
    privacyPolicyText: v.optional(v.string()),
    faqs: v.optional(
      v.array(
        v.object({
          id: v.string(),
          question: v.string(),
        })
      )
    ),
    sidebarFooterText: v.optional(
      v.object({
        title: v.string(),
        paragraph: v.string(),
      })
    ),
    faqTitle: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    mutedTextColor: v.optional(v.string()),
    borderColor: v.optional(v.string()),
    buttonBackgroundColor: v.optional(v.string()),
    greetMessage: v.optional(v.string()), // from user's schema
    enabledDepartments: v.optional(v.array(v.string())), // Department IDs that are enabled for this widget
    
    defaultSuggestions: v.optional(
      v.object({
        // from user's schema
        suggestion1: v.optional(v.string()),
        suggestion2: v.optional(v.string()),
        suggestion3: v.optional(v.string()),
      })
    ),
  }).index("by_organization_id", ["organizationId"]),

  superAdminConversations: defineTable({
    userId: v.string(),
    assistantId: v.id("assistants"),
    threadId: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_thread", ["threadId"]),

  messages: defineTable({
    threadId: v.string(),
    assistantId: v.id("assistants"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  conversations: defineTable({
    threadId: v.optional(v.string()),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved")
      )
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    .index("by_thread_id", ["threadId"]),
  contactSessions: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_expires_at", ["expiresAt"]),
  users: defineTable({
    name: v.string(),
  }),
  webConversations: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    threadId: v.string(),
    message: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          type: v.string(),
          url: v.string(),
        })
      )
    ),
    assistantId: v.string(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_user_id", ["userId"])
    .index("by_thread_id", ["threadId"]),

  municipalityAssistants: defineTable({
    municipalityId: v.string(),
    assistantId: v.id("assistants"),
  })
    .index("by_assistant_id", ["assistantId"])
    .index("by_municipality_id", ["municipalityId"]),

  assistants: defineTable({
    organizationId: v.optional(v.string()),
    name: v.string(),
    prompt: v.string(),
    model: v.string(),
    baseSystemPrompt: v.optional(v.string()),
    starterPrompt: v.optional(v.array(v.string())),
    type: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("custom")
    ),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    maxSteps: v.optional(v.number()),
    isActive: v.boolean(),
    color: v.optional(v.string()),
    vectorStoreId: v.string(),
    description: v.optional(v.object({})),
    countryCode: v.optional(v.string()),
    createdBy: v.string(), // Required user ID field
    settings: v.optional(
      v.object({
        enableToolUse: v.optional(v.boolean()),
        allowedTools: v.optional(v.array(v.string())),
        maxHistoryMessages: v.optional(v.number()),
      })
    ),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_country_code", ["countryCode"])
    .index("by_created_by", ["createdBy"]),

  tools: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(),
  }).index("by_name", ["name"]),

  portalFeedback: defineTable({
    customerId: v.string(),
    feedbackType: v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("improvement"),
      v.literal("general")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(
      v.literal("open"),
      v.literal("in-progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    screenshots: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    adminResponse: v.optional(v.string()),
  })
    .index("by_customerId", ["customerId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_feedbackType", ["feedbackType"])
    .index("by_assignedTo", ["assignedTo"]),

  knowledgebases: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    storageId: v.string(),
    fileType: v.union(
      v.literal("document"),
      v.literal("link"),
      v.literal("sitemap"),
      v.literal("text")
    ),
    fileSize: v.number(),
    uploadedBy: v.string(),
    organizationId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    ),
    processingError: v.optional(v.string()),
    vectorStoreId: v.string(),
    contentHash: v.optional(v.string()),
    frequency: v.union(
      v.literal("never"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    chunkCount: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        pageCount: v.optional(v.number()),
        wordCount: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),
  })
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_organizationId", ["organizationId"])
    .index("by_status", ["status"]),

  superAdminKnowledgebases: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    taskId: v.string(),
    sourceUrl: v.string(),
    department: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    itemExternalId: v.optional(v.string()),
    includeImg: v.optional(v.boolean()),
    includeDoc: v.optional(v.boolean()),
    assistantId: v.id("assistants"),
    fileType: v.union(
      v.literal("document"),
      v.literal("link"),
      v.literal("sitemap"),
      v.literal("text")
    ),
    fileSize: v.optional(v.string()),
    uploadedBy: v.string(),
    isActive: v.boolean(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("not found"),
      v.literal("failed")
    ),
    processingError: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    frequency: v.union(
      v.literal("never"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    chunkCount: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        pageCount: v.optional(v.number()),
        wordCount: v.optional(v.number()),
        language: v.optional(v.string()),
      })
    ),
  })
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_assistantId", ["assistantId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_sourceUrl", ["sourceUrl"])
    .index("by_status", ["status"]),

  assistantTools: defineTable({
    assistantId: v.id("assistants"),
    toolId: v.id("tools"),
    // Qdrant tool fields
    collectionName: v.optional(v.string()),
    defaultLimit: v.optional(v.number()),
    defaultFilter: v.optional(v.string()),
    // Web tool fields
    urls: v.optional(v.array(v.string())),
    crawlDepth: v.optional(v.number()),
    // Search tool fields
    defaultQuery: v.optional(v.string()),
    searchEngine: v.optional(v.string()),
    maxResults: v.optional(v.number()),
  })
    .index("by_assistant_id", ["assistantId"])
    .index("by_tool_id", ["toolId"])
    .index("by_assistant_and_tool", ["assistantId", "toolId"]),

  

  temporaryUrlStorage: defineTable({
    sourceUrl: v.optional(v.string()),
    taskId: v.optional(v.string()),
    status: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_taskId", ["taskId"]),

  countryCodes: defineTable({
    name: v.string(),
    code: v.string(),
    shortName: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_is_active", ["isActive"])
    .index("by_name", ["name"])
    .index("by_short_name", ["shortName"]),

  municipalities: defineTable({
    orgId: v.string(),
    name: v.string(),
    countryCode: v.string(),
    collectionName: v.string(),
    promptTemplate: v.string(),
    isActive: v.boolean(),
    helpDesk: v.boolean(),
    websiteLink: v.optional(v.string()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_country_code", ["countryCode"])
    .index("by_is_active", ["isActive"])
    .index("by_name", ["name"])
    .index("by_country_and_active", ["countryCode", "isActive"]),

  // Stores all notifications created by super admins or system events
  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    countryCode: v.string(),
    type: v.union(
      v.literal("update"),
      v.literal("info"),
      v.literal("error"),
      v.literal("alert")
    ),
    actionUrl: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  })
    .index("by_countryCode", ["countryCode"])
    .index("by_type", ["type"])
    .index("by_createdBy", ["createdBy"])
    .index("by_country_and_type", ["countryCode", "type"]),

  // Links notifications to organizations
  organizationNotifications: defineTable({
    organizationId: v.string(),
    notificationId: v.id("notifications"),
    role: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_notificationId", ["notificationId"]),

  // Scraper request parameters table
  scraperRequestParams: defineTable({
    baseUrl: v.optional(v.string()),
    netloc: v.optional(v.string()),
    browserEngine: v.optional(v.string()),
    removeSelectors: v.optional(v.string()),
    waitForSelector: v.optional(v.string()),
    targetSelector: v.optional(v.string()),
    contentFormat: v.optional(v.string()),
    timeout: v.optional(v.number()),
    tokenBudget: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_baseUrl", ["baseUrl"])
    .index("by_netloc", ["netloc"])
    .index("by_browserEngine", ["browserEngine"])
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"]),
});
