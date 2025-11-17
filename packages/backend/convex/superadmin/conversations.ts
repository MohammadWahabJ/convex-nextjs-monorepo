import { v } from "convex/values";
import { action } from "../_generated/server";
import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { checkUserAuthenticated } from "../helper";

/**
 * Creates an ephemeral, non-persistent chat response.
 * This action generates an assistant's response without saving any messages
 * to the database and returns the complete text.
 */
export const ephemeralChat = action({
  args: {
    prompt: v.string(),
    baseSystemPrompt: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // 0. Check user authentication first
    const identity = await checkUserAuthenticated(ctx);

    // 1. Initialize an agent with the provided configuration.
    const agent = new Agent(components.agent, {
      name: "ephemeralAgent",
      languageModel: openai.chat(args.model as any),
      instructions: args.baseSystemPrompt,
    });

    // 2. Generate a complete text response without saving anything to the DB.
    const { text } = await agent.generateText(
      ctx,
      { 
        // Use the authenticated user's ID for ephemeral chat
        userId: identity.subject,
      },
      {
        messages: [
          {
            role: "user",
            content: args.prompt,
          },
        ],
      }
    );

    // 3. Return the complete text response directly to the client.
    return text;
  },
});
