"use client";

import { useState, useMemo } from "react";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  EditIcon,
  Trash2Icon,
  BotIcon,
  SettingsIcon,
  Building2,
  Cpu,
  Palette,
  Activity,
  ZapIcon,
  WrenchIcon,
  Database,
  Globe,
  Search,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AssignToolDialog } from "@/modules/tools/components/assign-tool-dialog";
import { AssistantTestModal } from "./assistantTestModal";

// Constants
const DEFAULT_COLOR = "#3B82F6";
const DESCRIPTION_MAX_LENGTH = 40;

const BADGE_STYLES = {
  type: {
    public: "bg-green-100 text-green-800 border-green-200",
    private: "bg-blue-100 text-blue-800 border-blue-200",
    custom: "bg-purple-100 text-purple-800 border-purple-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  },
  model: {
    gpt4: "bg-emerald-100 text-emerald-800 border-emerald-200",
    gpt35: "bg-orange-100 text-orange-800 border-orange-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  },
  status: {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
    unassigned: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  tool: {
    qdrant: "bg-blue-100 text-blue-800 border-blue-200",
    web: "bg-green-100 text-green-800 border-green-200",
    search: "bg-purple-100 text-purple-800 border-purple-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  },
} as const;

const TOOL_ICONS = {
  qdrant: Database,
  web: Globe,
  search: Search,
  default: WrenchIcon,
} as const;

// Types
type AssistantType = "public" | "private" | "custom";

interface AssistantSettings {
  enableToolUse?: boolean;
  allowedTools?: string[];
  maxHistoryMessages?: number;
}

interface Assistant {
  _id: Id<"assistants">;
  name: string;
  description?: Record<string, any>;
  baseSystemPrompt?: string;
  model: string;
  maxSteps?: number;
  maxTokens?: number;
  type: AssistantType;
  isActive?: boolean;
  color?: string;
  organizationId?: string;
  temperature?: number;
  prompt: string;
  vectorStoreId: string;
  starterPrompt?: string[];
  settings?: AssistantSettings;
  countryCode?: string;
  createdBy?: string;
}

interface AssistantCardProps {
  assistant: Assistant;
  onEdit?: (assistant: Assistant) => void;
  onDelete?: (assistant: { id: Id<"assistants">; name: string }) => void;
}

// Utility functions
const getBadgeStyle = (type: AssistantType): string => {
  return BADGE_STYLES.type[type] || BADGE_STYLES.type.default;
};

const getModelBadgeStyle = (model: string): string => {
  if (model.includes("gpt-4")) return BADGE_STYLES.model.gpt4;
  if (model.includes("gpt-3.5")) return BADGE_STYLES.model.gpt35;
  return BADGE_STYLES.model.default;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
};

const formatDescription = (
  description?: Record<string, any>
): string | undefined => {
  if (!description) return undefined;
  return typeof description === "object"
    ? JSON.stringify(description)
    : (description as string);
};

const getToolIcon = (toolType: string) => {
  return TOOL_ICONS[toolType as keyof typeof TOOL_ICONS] || TOOL_ICONS.default;
};

const getToolBadgeStyle = (toolType: string): string => {
  return (
    BADGE_STYLES.tool[toolType as keyof typeof BADGE_STYLES.tool] ||
    BADGE_STYLES.tool.default
  );
};

export function AssistantCard({
  assistant,
  onEdit,
  onDelete,
}: AssistantCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isConversationTestModalOpen, setIsConversationTestModalOpen] =
    useState(false);

  // Fetch assistant tools
  const assistantTools = useQuery(api.superadmin.tools.getToolsByAssistant, {
    assistantId: assistant._id,
  });

  // Memoized values
  const assistantColor = assistant.color || DEFAULT_COLOR;
  const description = assistant.baseSystemPrompt || assistant.prompt;
  const isActive = assistant.isActive !== false;
  const deleteLabel =
    assistant.isActive === false && !assistant.organizationId
      ? "Permanently Delete"
      : "Deactivate Assistant";

  const assistantForDialog = useMemo(
    () => ({
      _id: assistant._id,
      name: assistant.name,
      description: formatDescription(assistant.description),
    }),
    [assistant._id, assistant.name, assistant.description]
  );

  // Event handlers
  const handleEdit = () => onEdit?.(assistant);
  const handleDelete = () =>
    onDelete?.({ id: assistant._id, name: assistant.name });
  const handleToolsClick = () => setIsAssignDialogOpen(true);
  const handleTestClick = () => setIsConversationTestModalOpen(true);

  return (
    <Card
      className={`relative group transition-all duration-200 hover:shadow-md ${
        isHovered ? "border-primary/50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="p-2 rounded-lg bg-opacity-10 border"
              style={{
                backgroundColor: `${assistantColor}20`,
                borderColor: `${assistantColor}30`,
              }}
            >
              <BotIcon className="size-5" style={{ color: assistantColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {assistant.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs ${getBadgeStyle(assistant.type)}`}
                >
                  {assistant.type}
                </Badge>

                <Badge
                  variant="outline"
                  className={`text-xs ${isActive ? BADGE_STYLES.status.active : BADGE_STYLES.status.inactive}`}
                >
                  {isActive && <Activity className="size-3 mr-1" />}
                  {isActive ? "Active" : "Inactive"}
                </Badge>

                {!assistant.organizationId && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${BADGE_STYLES.status.unassigned}`}
                  >
                    Unassigned
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <SettingsIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <EditIcon className="mr-2 size-4" />
                Edit Assistant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                {deleteLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Description */}
        {description && (
          <CardDescription className="text-sm leading-relaxed">
            {truncateText(description, DESCRIPTION_MAX_LENGTH)}
          </CardDescription>
        )}
        <div className="text-sm leading-relaxed">Id: {assistant._id}</div>

        {/* Key Information */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Model:</span>
            <Badge
              variant="outline"
              className={`text-xs ${getModelBadgeStyle(assistant.model)}`}
            >
              {assistant.model}
            </Badge>
          </div>

          {assistant.maxSteps && (
            <div className="flex items-center gap-2">
              <ZapIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Steps:</span>
              <span className="font-medium">{assistant.maxSteps}</span>
            </div>
          )}

          <div className="flex items-center gap-2 col-span-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Country:</span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {assistant.countryCode || "N/A"}
            </code>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created by:</span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate">
              {assistant.createdBy || "Unknown"}
            </code>
          </div>
        </div>

        {/* Settings Summary */}
        {assistant.settings && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {assistant.settings.enableToolUse && (
                <div className="flex items-center gap-1">
                  <SettingsIcon className="size-3" />
                  <span>Tools Enabled</span>
                </div>
              )}
              {assistant.settings.allowedTools &&
                assistant.settings.allowedTools.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{assistant.settings.allowedTools.length} tools</span>
                  </div>
                )}
              {assistant.temperature && (
                <div className="flex items-center gap-1">
                  <Palette className="size-3" />
                  <span>Temp: {assistant.temperature}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Tools */}
        {assistantTools === undefined ? (
          // Loading state
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WrenchIcon className="size-3" />
              <span>Loading tools...</span>
            </div>
          </div>
        ) : assistantTools.length > 0 ? (
          // Tools assigned
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <WrenchIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Assigned Tools ({assistantTools.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assistantTools.slice(0, 2).map((toolAssignment: any) => {
                const ToolIcon = getToolIcon(toolAssignment.tool.type);

                // Create dynamic tooltip based on tool type
                let tooltipText = `${toolAssignment.tool.name} (${toolAssignment.tool.type})`;
                if (
                  toolAssignment.tool.type === "qdrant" &&
                  toolAssignment.collectionName
                ) {
                  tooltipText += ` - Collection: ${toolAssignment.collectionName}`;
                } else if (
                  toolAssignment.tool.type === "web" &&
                  toolAssignment.urls
                ) {
                  tooltipText += ` - URLs: ${toolAssignment.urls.length} configured`;
                } else if (
                  toolAssignment.tool.type === "search" &&
                  toolAssignment.defaultQuery
                ) {
                  tooltipText += ` - Query: ${toolAssignment.defaultQuery}`;
                }

                return (
                  <div
                    key={toolAssignment._id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 text-xs hover:bg-muted/60 transition-colors"
                    title={tooltipText}
                  >
                    <ToolIcon className="size-3 flex-shrink-0" />
                    <span className="font-medium truncate max-w-[80px]">
                      {toolAssignment.tool.name}
                    </span>
                    <div
                      className="size-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          toolAssignment.tool.type === "qdrant"
                            ? "#3b82f6"
                            : toolAssignment.tool.type === "web"
                              ? "#10b981"
                              : "#a855f7",
                      }}
                    />
                  </div>
                );
              })}
              {assistantTools.length > 2 && (
                <div
                  className="flex items-center px-2 py-1 rounded-md bg-muted/20 text-xs text-muted-foreground hover:bg-muted/30 transition-colors cursor-default"
                  title={`${assistantTools.length - 2} more tools assigned`}
                >
                  <span>+{assistantTools.length - 2}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          // No tools assigned
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WrenchIcon className="size-3" />
              <span>No tools assigned</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleEdit}
          >
            <EditIcon className="mr-2 size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleToolsClick}
          >
            <WrenchIcon className="mr-2 size-4" />
            Tools
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleTestClick}
          >
            {/* <WrenchIcon className="mr-2 size-4" /> */}
            Test
          </Button>
        </div>
      </CardContent>

      {/* Assign Tools Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Manage Tools for {assistant.name}</DialogTitle>
            <DialogDescription>
              Assign and configure tools for this assistant
            </DialogDescription>
          </DialogHeader>
          <AssignToolDialog
            assistant={assistantForDialog}
            onSuccess={() => setIsAssignDialogOpen(false)}
            onCancel={() => setIsAssignDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Conversation Test Modal */}
      <AssistantTestModal
        assistant={assistant}
        isOpen={isConversationTestModalOpen}
        onClose={() => setIsConversationTestModalOpen(false)}
      />
    </Card>
  );
}
