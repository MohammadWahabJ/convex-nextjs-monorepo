import { httpRouter } from "convex/server";
import { 
  getTmpUrlStorage, 
  createTmpUrlStorage, 
  updateTmpUrlStorage, 
  deleteTmpUrlStorage 
} from "./superadmin/tmpUrlStorageHttp";
import { 
  getKnowledgebase, 
  createKnowledgebase, 
  updateKnowledgebase, 
  deleteKnowledgebase 
} from "./superadmin/knowledgebaseHttp";
import { clerkWebhookHandler } from "./superadmin/clerkWebhookHttp";

const http = httpRouter();

// ===============================
// TMP URL STORAGE API ROUTES
// ===============================

// GET /api/superadmin/tmp-url-storage - Get records with filters
http.route({
  path: "/api/superadmin/tmp-url-storage",
  method: "GET",
  handler: getTmpUrlStorage,
});

// POST /api/superadmin/tmp-url-storage - Create records
http.route({
  path: "/api/superadmin/tmp-url-storage",
  method: "POST",
  handler: createTmpUrlStorage,
});

// PUT /api/superadmin/tmp-url-storage - Update records
http.route({
  path: "/api/superadmin/tmp-url-storage",
  method: "PUT",
  handler: updateTmpUrlStorage,
});

// DELETE /api/superadmin/tmp-url-storage - Delete records
http.route({
  path: "/api/superadmin/tmp-url-storage",
  method: "DELETE",
  handler: deleteTmpUrlStorage,
});

// ===============================
// KNOWLEDGEBASE API ROUTES
// ===============================

// GET /api/superadmin/knowledgebase - Get knowledge base entries with filters
http.route({
  path: "/api/superadmin/knowledgebase",
  method: "GET",
  handler: getKnowledgebase,
});

// POST /api/superadmin/knowledgebase - Create knowledge base entries
http.route({
  path: "/api/superadmin/knowledgebase",
  method: "POST",
  handler: createKnowledgebase,
});

// PUT /api/superadmin/knowledgebase - Update knowledge base entries
http.route({
  path: "/api/superadmin/knowledgebase",
  method: "PUT",
  handler: updateKnowledgebase,
});

// DELETE /api/superadmin/knowledgebase - Delete knowledge base entries
http.route({
  path: "/api/superadmin/knowledgebase",
  method: "DELETE",
  handler: deleteKnowledgebase,
});

// ===============================
// CLERK WEBHOOK
// ===============================

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhookHandler,
});

export default http;
