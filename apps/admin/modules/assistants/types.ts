import { Id } from "@workspace/backend/_generated/dataModel";

export interface AssistantType {
  _id: Id<"assistants">;
  name: string;
  description?: Record<string, unknown>;
  baseSystemPrompt?: string;
  model: string;
  maxSteps?: number;
  maxTokens?: number;
  type: "public" | "private" | "custom";
  isActive?: boolean;
  color?: string;
  organizationId?: string;
  temperature?: number;
  prompt: string;
  vectorStoreId: string;
  starterPrompt?: string[];
  countryCode?: string;
  createdBy?: string;
  settings?: {
    enableToolUse?: boolean;
    allowedTools?: string[];
    maxHistoryMessages?: number;
  };
}
