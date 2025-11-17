"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { AssistantForm } from "./assistant-form";
import { AssistantType } from "../types";

interface EditAssistantDialogProps {
  assistant: AssistantType | null;
  onClose: () => void;
}

export function EditAssistantDialog({
  assistant,
  onClose,
}: EditAssistantDialogProps) {
  return (
    <Dialog open={!!assistant} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Assistant</DialogTitle>
          <DialogDescription>
            Update the assistant's configuration
          </DialogDescription>
        </DialogHeader>
        {assistant && (
          <AssistantForm
            initialData={{
              id: assistant._id,
              name: assistant.name,
              prompt: assistant.prompt,
              model: assistant.model,
              baseSystemPrompt: assistant.baseSystemPrompt,
              starterPrompt: assistant.starterPrompt,
              type: assistant.type,
              temperature: assistant.temperature,
              maxTokens: assistant.maxTokens,
              maxSteps: assistant.maxSteps,
              isActive: assistant.isActive,
              color: assistant.color,
              vectorStoreId: assistant.vectorStoreId,
              description: assistant.description,
              settings: assistant.settings,
            }}
            onSuccess={onClose}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
