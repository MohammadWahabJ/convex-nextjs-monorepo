"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface AssistantSelectorProps {
  selectedAssistant: string;
  onAssistantChange: (value: string) => void;
  assistants: any[] | undefined;
}

export function AssistantSelector({
  selectedAssistant,
  onAssistantChange,
  assistants,
}: AssistantSelectorProps) {
  return (
    <div className="w-full max-w-md flex items-center space-x-4">
      <p className="min-w-[100px]">Select Assistant</p>
      <Select value={selectedAssistant} onValueChange={onAssistantChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Choose an assistant..." />
        </SelectTrigger>
        <SelectContent>
          {assistants?.map((assistant: any) => (
            <SelectItem key={assistant._id} value={assistant._id}>
              {assistant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
