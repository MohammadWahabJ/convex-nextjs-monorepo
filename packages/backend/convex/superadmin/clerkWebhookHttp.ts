import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});

// Clerk webhook handler
export const clerkWebhookHandler = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);

  if (!event) {
    return new Response("Error occurred", { status: 400 });
  }

  switch (event.type) {
    case "subscription.updated": {
      const subscription = event.data as {
        status: string;
        payer?: {
          organization_id: string;
        }
      };

      const organizationId = subscription.payer?.organization_id;

      if (!organizationId) {
        return new Response("Missing Organization ID", { status: 400 });
      }

      const newMaxAllowedMemberships = subscription.status === "active" ? 5 : 1;

      await clerkClient.organizations.updateOrganization(organizationId, {
        maxAllowedMemberships: newMaxAllowedMemberships,
      });

      await ctx.runMutation(internal.system.subscriptions.upsert, {
        organizationId,
        status: subscription.status,
      });

      break;
    }
    default:
      console.log("Ignored Clerk webhook event", event.type);
  }

  return new Response(null, { status: 200 });
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error: unknown) {
    console.error(`Error verifying webhook event`, error);
    return null;
  }
}