/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { AssignToolDialog } from "@/modules/tools/components/assign-tool-dialog";
import {
  BotIcon,
  Loader2,
  WrenchIcon,
  Database,
  Globe,
  Search,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

const toolTypeIcons = {
  qdrant: Database,
  web: Globe,
  search: Search,
  default: WrenchIcon,
};

const toolTypeColors = {
  qdrant: "bg-blue-100 text-blue-800",
  web: "bg-green-100 text-green-800",
  search: "bg-purple-100 text-purple-800",
  default: "bg-gray-100 text-gray-800",
};

function AssistantCard({
  assistant,
  onAssignTools,
}: {
  assistant: any;
  onAssignTools: (assistant: any) => void;
}) {
  const assistantTools = useQuery(api.superadmin.tools.getToolsByAssistant, {
    assistantId: assistant._id,
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BotIcon className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">{assistant.name}</CardTitle>
          </div>
          <Button size="sm" onClick={() => onAssignTools(assistant)}>
            <WrenchIcon className="mr-2 size-4" />
            Manage Tools
          </Button>
        </div>
        {assistant.baseSystemPrompt && (
          <CardDescription className="text-sm text-muted-foreground">
            {assistant.baseSystemPrompt.length > 100
              ? `${assistant.baseSystemPrompt.substring(0, 100)}...`
              : assistant.baseSystemPrompt}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium">{assistant.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Steps:</span>
            <span className="font-medium">{assistant.maxSteps || 10}</span>
          </div>
        </div>

        {/* Assigned Tools */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <WrenchIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Assigned Tools</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {assistantTools?.length || 0}
            </Badge>
          </div>

          {assistantTools?.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tools assigned</p>
          ) : (
            <div className="space-y-1">
              {assistantTools?.slice(0, 3).map((toolAssignment: any) => {
                const IconComponent =
                  toolTypeIcons[
                    toolAssignment.tool.type as keyof typeof toolTypeIcons
                  ] || toolTypeIcons.default;
                const colorClass =
                  toolTypeColors[
                    toolAssignment.tool.type as keyof typeof toolTypeColors
                  ] || toolTypeColors.default;

                return (
                  <div
                    key={toolAssignment._id}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{toolAssignment.tool.name}</span>
                    <Badge className={`text-xs ${colorClass}`}>
                      {toolAssignment.collectionName}
                    </Badge>
                  </div>
                );
              })}
              {assistantTools && assistantTools.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{assistantTools.length - 3} more
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssistantToolsPage() {
  const assistants = useQuery(api.superadmin.assistant.getAllAssistants);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleAssignTools = (assistant: any) => {
    setSelectedAssistant(assistant);
    setIsAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assistant Tools</h1>
          <p className="text-muted-foreground">
            Assign and manage tools for AI assistants
          </p>
        </div>
      </div>

      {/* Assistants List */}
      {!assistants ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : assistants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BotIcon className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No assistants found</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              Create assistants first before assigning tools
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assistants.map((assistant) => (
            <AssistantCard
              key={assistant._id}
              assistant={assistant}
              onAssignTools={handleAssignTools}
            />
          ))}
        </div>
      )}

      {/* Assign Tools Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Manage Tools for {selectedAssistant?.name}
            </DialogTitle>
            <DialogDescription>
              Assign and configure tools for this assistant
            </DialogDescription>
          </DialogHeader>
          {selectedAssistant && (
            <AssignToolDialog
              assistant={selectedAssistant}
              onSuccess={() => setIsAssignDialogOpen(false)}
              onCancel={() => setIsAssignDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
