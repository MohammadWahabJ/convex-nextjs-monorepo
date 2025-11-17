"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
import { Loader2, Building } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@workspace/backend/_generated/dataModel";

interface UpdateDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: Id<"assistants"> | null;
  onSuccess?: () => void;
}

const AVAILABLE_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export function UpdateDepartmentModal({
  open,
  onOpenChange,
  departmentId,
  onSuccess,
}: UpdateDepartmentModalProps) {
  const department = useQuery(
    api.web.department.getDepartmentById,
    departmentId ? { id: departmentId } : "skip"
  );
  const updateDepartment = useMutation(api.web.department.updateDepartment);

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDetails(department.prompt || "");
      setModel(department.model || "gpt-4o-mini");
      setStarterPrompt(department.starterPrompt?.join("\n") || "");
    } else if (!open) {
      // Reset form when dialog closes
      setName("");
      setDetails("");
      setModel("gpt-4o-mini");
      setStarterPrompt("");
      setError(null);
    }
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) return;

    setError(null);
    setIsLoading(true);

    try {
      await updateDepartment({
        id: departmentId,
        name,
        details: details || undefined,
        model,
        starterPrompt: starterPrompt
          ? starterPrompt.split("\n").filter((line) => line.trim())
          : undefined,
      });
      toast.success("Department updated successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error updating department:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update department."
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to update department."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  if (departmentId && department === undefined) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 ">
              <Building className="h-5 w-5" />
              Update Department
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading department details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Update Department
          </DialogTitle>
          <DialogDescription>
            Edit the details for <strong>{department?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="details">Prompt (Optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              disabled={isLoading}
              placeholder="Custom instructions or context for this department's AI assistant..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel} disabled={isLoading}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="starterPrompt">Starter Prompts (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Enter one suggestion per line. These will be shown as quick-start
              questions for users.
            </p>
            <Textarea
              id="starterPrompt"
              value={starterPrompt}
              onChange={(e) => setStarterPrompt(e.target.value)}
              rows={4}
              disabled={isLoading}
              placeholder="How can I submit a complaint?&#10;What are the office hours?&#10;Where can I find parking information?"
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
