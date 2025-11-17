"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Bot, Search, Check, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface AssignAssistantDialogProps {
  municipalityId: string;
  municipalityName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Assistant {
  _id: Id<"assistants">;
  name: string;
  model: string;
  type: "public" | "private" | "custom";
  baseSystemPrompt?: string;
  prompt?: string;
  isAssignedToMunicipality: boolean;
}

export function AssignAssistantDialog({
  municipalityId,
  municipalityName,
  open,
  onOpenChange,
  onSuccess,
}: AssignAssistantDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all assistants with assignment status for this municipality
  const assistants = useQuery(
    api.superadmin.assistant.getAllAssistantsWithAssignmentStatus,
    {
      municipalityId,
    }
  );

  const assignAssistant = useMutation(
    api.superadmin.assistant.assignAssistantToMunicipality
  );
  const unassignAssistant = useMutation(
    api.superadmin.assistant.unassignAssistantFromMunicipality
  );

  // Filter assistants based on search query
  const filteredAssistants =
    assistants?.filter(
      (assistant) =>
        assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assistant.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assistant.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleToggleAssignment = async (assistant: Assistant) => {
    try {
      if (assistant.isAssignedToMunicipality) {
        await unassignAssistant({
          assistantId: assistant._id,
          municipalityId: municipalityId,
        });
      } else {
        await assignAssistant({
          assistantId: assistant._id,
          municipalityId: municipalityId,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Failed to toggle assistant assignment:", error);
    }
  };

  const assignedCount =
    assistants?.filter((a) => a.isAssignedToMunicipality).length || 0;
  const totalCount = assistants?.length || 0;

  if (assistants === undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-xl font-semibold">
            Manage Assistants
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Manage Assistants
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Assign or unassign AI assistants for{" "}
            <span className="font-medium text-foreground">
              {municipalityName}
            </span>
            <br />
            <span className="text-xs">
              {assignedCount} of {totalCount} assistants assigned
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assistants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Assistant List */}
        <div className="flex-1 min-h-0">
          {filteredAssistants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "No assistants found"
                  : "No assistants available"}
              </p>
              {searchQuery && (
                <p className="text-muted-foreground/70 text-xs mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(90vh-250px)] overflow-y-auto pr-2">
              {filteredAssistants.map((assistant) => (
                <div
                  key={assistant._id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm",
                    assistant.isAssignedToMunicipality
                      ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-900/10"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        assistant.isAssignedToMunicipality
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-muted"
                      )}
                    >
                      <Bot
                        className={cn(
                          "h-5 w-5",
                          assistant.isAssignedToMunicipality
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {assistant.name}
                        </h3>
                        {assistant.isAssignedToMunicipality && (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {assistant.model}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            assistant.type === "public"
                              ? "text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800"
                              : assistant.type === "private"
                                ? "text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800"
                                : "text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800"
                          )}
                        >
                          {assistant.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={
                      assistant.isAssignedToMunicipality ? "outline" : "default"
                    }
                    onClick={() => handleToggleAssignment(assistant)}
                    className={cn(
                      "ml-4 flex-shrink-0",
                      assistant.isAssignedToMunicipality
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {assistant.isAssignedToMunicipality ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {assignedCount} assigned • {totalCount - assignedCount} available
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
