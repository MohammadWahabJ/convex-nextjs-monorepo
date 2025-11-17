"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Loader2 } from "lucide-react";

interface AssistantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id: Id<"assistants">;
    name: string;
    prompt: string;
    model: string;
    baseSystemPrompt?: string;
    starterPrompt?: string[];
    type: "public" | "private" | "custom";
    temperature?: number;
    maxTokens?: number;
    maxSteps?: number;
    isActive?: boolean;
    color?: string;
    vectorStoreId: string;
    description?: Record<string, any>;
    settings?: {
      enableToolUse?: boolean;
      allowedTools?: string[];
      maxHistoryMessages?: number;
    };
  };
}

const AVAILABLE_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const ASSISTANT_TYPES = [
  // { value: "public", label: "Public" },
  // { value: "private", label: "Private" },
  { value: "custom", label: "Custom" },
];

export function AssistantForm({
  onSuccess,
  onCancel,
  initialData,
}: AssistantFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [prompt, setPrompt] = useState(initialData?.prompt || "");
  const [baseSystemPrompt, setBaseSystemPrompt] = useState(
    initialData?.baseSystemPrompt || ""
  );
  const [starterPrompt, setStarterPrompt] = useState(
    initialData?.starterPrompt?.join("\n") || ""
  );
  const [type, setType] = useState<"public" | "private" | "custom">(
    initialData?.type || "custom"
  );
  const [model, setModel] = useState(initialData?.model || "gpt-4o-mini");
  const [temperature, setTemperature] = useState(
    initialData?.temperature?.toString() || "0.7"
  );
  const [maxTokens, setMaxTokens] = useState(
    initialData?.maxTokens?.toString() || "4000"
  );
  const [maxSteps, setMaxSteps] = useState(
    initialData?.maxSteps?.toString() || "10"
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [color, setColor] = useState(initialData?.color || "#3B82F6");
  const [vectorStoreId, setVectorStoreId] = useState(
    initialData?.vectorStoreId || ""
  );
  const [enableToolUse, setEnableToolUse] = useState(
    initialData?.settings?.enableToolUse ?? true
  );
  const [allowedTools, setAllowedTools] = useState(
    initialData?.settings?.allowedTools?.join(", ") || ""
  );
  const [maxHistoryMessages, setMaxHistoryMessages] = useState(
    initialData?.settings?.maxHistoryMessages?.toString() || "100"
  );

  const createAssistant = useMutation(api.superadmin.assistant.createAssistant);
  const updateAssistant = useMutation(api.superadmin.assistant.updateAssistant);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const commonData = {
        name,
        prompt,
        baseSystemPrompt: baseSystemPrompt || undefined,
        model,
        type: type as "public" | "private" | "custom",
        temperature: temperature ? parseFloat(temperature) : undefined,
        maxTokens: maxTokens ? parseInt(maxTokens, 10) : undefined,
        maxSteps: maxSteps ? parseInt(maxSteps, 10) : undefined,
        isActive,
        color: color || undefined,
        vectorStoreId,
        settings: {
          enableToolUse,
          allowedTools: allowedTools
            ? allowedTools
                .split(",")
                .map((tool) => tool.trim())
                .filter(Boolean)
            : undefined,
          maxHistoryMessages: maxHistoryMessages
            ? parseInt(maxHistoryMessages, 10)
            : undefined,
        },
        starterPrompt: starterPrompt
          ? starterPrompt.split("\n").filter((line) => line.trim())
          : undefined,
      };

      if (initialData?.id) {
        // Update existing assistant
        await updateAssistant({
          id: initialData.id,
          ...commonData,
        });
      } else {
        // Create new assistant
        await createAssistant({
          ...commonData,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assistant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {initialData ? "Edit Assistant" : "Create New Assistant"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Funding Assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Main Prompt *</Label>
            <Textarea
              id="prompt"
              placeholder="Main prompt for the assistant..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseSystemPrompt">Base System Prompt</Label>
            <Textarea
              id="baseSystemPrompt"
              placeholder="You are a helpful assistant that..."
              value={baseSystemPrompt}
              onChange={(e) => setBaseSystemPrompt(e.target.value)}
              rows={4}
            />
            <p className="text-muted-foreground text-xs">
              This prompt defines the assistant's behavior and personality
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starterPrompt">Starter Prompts</Label>
            <Textarea
              id="starterPrompt"
              placeholder="Enter starter prompts, one per line..."
              value={starterPrompt}
              onChange={(e) => setStarterPrompt(e.target.value)}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              One starter prompt per line
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={type}
                onValueChange={(value: "public" | "private" | "custom") =>
                  setType(value)
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select assistant type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSISTANT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="1"
                step="0.1"
                placeholder="0.7"
                value={temperature}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 0 && value <= 1) {
                    setTemperature(e.target.value);
                  } else {
                    setError("Temperature must be between 0 and 1");
                  }
                }}
              />
              <p className="text-muted-foreground text-xs">
                Controls randomness (0-1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                max="16000"
                placeholder="4000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Maximum response length
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSteps">Max Steps</Label>
              <Input
                id="maxSteps"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={maxSteps}
                onChange={(e) => setMaxSteps(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Maximum tool calls per interaction
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Assistant theme color
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vectorStoreId">Vector Store ID *</Label>
              <Input
                id="vectorStoreId"
                placeholder="Vector store identifier"
                value={vectorStoreId}
                onChange={(e) => setVectorStoreId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
            <p className="text-muted-foreground text-xs">
              Whether the assistant is currently active
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Settings</h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableToolUse"
                  checked={enableToolUse}
                  onChange={(e) => setEnableToolUse(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="enableToolUse">Enable Tool Use</Label>
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="allowedTools">Allowed Tools</Label>
              <Input
                id="allowedTools"
                placeholder="tool1, tool2, tool3"
                value={allowedTools}
                onChange={(e) => setAllowedTools(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Comma-separated list of allowed tools
              </p>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="maxHistoryMessages">Max History Messages</Label>
              <Input
                id="maxHistoryMessages"
                type="number"
                min="1"
                max="200"
                placeholder="100"
                value={maxHistoryMessages}
                onChange={(e) => setMaxHistoryMessages(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Maximum number of messages to keep in history
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {initialData ? "Update Assistant" : "Create Assistant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
