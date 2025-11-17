"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
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

interface ToolFormProps {
  initialData?: {
    id: Id<"tools">;
    name: string;
    description: string;
    type: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const toolTypes = [
  {
    value: "qdrant",
    label: "Qdrant Search",
    description: "Semantic search in vector database",
  },
  {
    value: "web",
    label: "Web Search",
    description: "Search the web for information",
  },
  {
    value: "database",
    label: "Database Query",
    description: "Query structured database",
  },
  {
    value: "api",
    label: "API Call",
    description: "Make API calls to external services",
  },
  {
    value: "custom",
    label: "Custom Tool",
    description: "Custom tool implementation",
  },
];

export function ToolForm({ initialData, onSuccess, onCancel }: ToolFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTool = useMutation(api.superadmin.tools.createTool);
  const updateTool = useMutation(api.superadmin.tools.updateTool);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tool name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Tool description is required";
    }

    if (!formData.type) {
      newErrors.type = "Tool type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateTool({
          id: initialData.id,
          name: formData.name,
          description: formData.description,
          type: formData.type,
        });
      } else {
        await createTool({
          name: formData.name,
          description: formData.description,
          type: formData.type,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save tool:", error);
      setErrors({ submit: "Failed to save tool. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tool Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., qdrant_search"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tool Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value)}
        >
          <SelectTrigger className={errors.type ? "border-destructive" : ""}>
            <SelectValue placeholder="Select tool type" />
          </SelectTrigger>
          <SelectContent>
            {toolTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe what this tool does..."
          rows={3}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm text-destructive">{errors.submit}</p>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? "Update Tool" : "Create Tool"}
        </Button>
      </div>
    </form>
  );
}
