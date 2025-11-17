"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface CreateDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  organizationId: string;
}

const AVAILABLE_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export default function CreateDepartmentModal({
  open,
  setOpen,
  organizationId,
}: CreateDepartmentModalProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDepartment = useMutation(api.web.department.createDepartment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createDepartment({
        name,
        details: details || undefined,
        organizationId,
        model,
        starterPrompt: starterPrompt
          ? starterPrompt.split("\n").filter((line) => line.trim())
          : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName("");
        setDetails("");
        setModel("gpt-4o-mini");
        setStarterPrompt("");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create department. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      setOpen(false);
      setName("");
      setDetails("");
      setModel("gpt-4o-mini");
      setStarterPrompt("");
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Create New Department</DialogTitle>
          <DialogDescription>
            Add a new department to your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Department Name *
            </label>
            <input
              className="w-full border border-input rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g., Human Resources, Engineering, Sales"
            />
          </div>

          {/* Department Details */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full border border-input rounded-lg px-4 py-2 min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition resize-none"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              placeholder="Brief description of the department's role and responsibilities..."
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              AI Model *
            </label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
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

          {/* Starter Prompts */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Starter Prompts (Optional)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter one suggestion per line. These will be shown as quick-start
              questions for users.
            </p>
            <textarea
              className="w-full border border-input rounded-lg px-4 py-2 min-h-[120px] bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition resize-none font-mono text-sm"
              value={starterPrompt}
              onChange={(e) => setStarterPrompt(e.target.value)}
              placeholder="How can I submit a complaint?&#10;What are the office hours?&#10;Where can I find parking information?"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="text-destructive text-sm font-medium">{error}</div>
          )}
          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              Department created successfully!
            </div>
          )}

          {/* Submit Button */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
