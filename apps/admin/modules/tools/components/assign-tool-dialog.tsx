"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Database,
  Globe,
  Search,
  WrenchIcon,
  PlusIcon,
  Trash2Icon,
  Loader2,
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

interface AssignToolDialogProps {
  assistant: {
    _id: Id<"assistants">;
    name: string;
    description?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignToolDialog({
  assistant,
  onSuccess,
  onCancel,
}: AssignToolDialogProps) {
  const [selectedToolId, setSelectedToolId] = useState<Id<"tools"> | "">("");
  const [collectionName, setCollectionName] = useState("");
  const [defaultLimit, setDefaultLimit] = useState<number>(5);
  const [defaultFilter, setDefaultFilter] = useState("");
  const [webUrls, setWebUrls] = useState<string[]>([""]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] =
    useState<Id<"assistantTools"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const tools = useQuery(api.superadmin.tools.getAllTools);
  const assistantTools = useQuery(api.superadmin.tools.getToolsByAssistant, {
    assistantId: assistant._id,
  });
  const assignTool = useMutation(api.superadmin.tools.assignToolToAssistant);
  const removeTool = useMutation(api.superadmin.tools.removeToolFromAssistant);

  const handleAssignTool = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedToolId) {
      return;
    }

    const selectedTool = tools?.find((tool) => tool._id === selectedToolId);
    if (!selectedTool) return;

    // Validate required fields based on tool type
    if (selectedTool.type === "qdrant" && !collectionName.trim()) {
      return;
    }
    if (
      selectedTool.type === "web" &&
      (!webUrls.length || !webUrls[0] || !webUrls[0].trim())
    ) {
      return;
    }
    if (selectedTool.type === "search" && !searchQuery.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let toolConfig: any = {};

      switch (selectedTool.type) {
        case "qdrant":
          toolConfig = {
            collectionName: collectionName.trim(),
            defaultLimit: defaultLimit || undefined,
            defaultFilter: defaultFilter.trim() || undefined,
          };
          break;
        case "web":
          toolConfig = {
            urls: webUrls.filter((url): url is string => Boolean(url?.trim())),
            crawlDepth: defaultLimit || 1,
          };
          break;
        case "search":
          toolConfig = {
            defaultQuery: searchQuery.trim(),
            searchEngine: searchEngine,
            maxResults: defaultLimit || 10,
          };
          break;
        default:
          toolConfig = {
            defaultLimit: defaultLimit || undefined,
            defaultFilter: defaultFilter.trim() || undefined,
          };
      }

      await assignTool({
        assistantId: assistant._id,
        toolId: selectedToolId as Id<"tools">,
        ...toolConfig,
      });

      // Reset form
      setSelectedToolId("");
      setCollectionName("");
      setDefaultLimit(5);
      setDefaultFilter("");
      setWebUrls([""]);
      setSearchQuery("");
      setSearchEngine("google");
    } catch (error) {
      console.error("Failed to assign tool:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTool = async () => {
    if (!deletingAssignmentId) return;

    setIsDeleting(true);
    try {
      await removeTool({
        assistantToolId: deletingAssignmentId,
      });
      setDeletingAssignmentId(null);
    } catch (error) {
      console.error("Failed to remove tool:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedTool = tools?.find((tool) => tool._id === selectedToolId);

  const addWebUrl = () => {
    setWebUrls([...webUrls, ""]);
  };

  const removeWebUrl = (index: number) => {
    setWebUrls(webUrls.filter((_, i) => i !== index));
  };

  const updateWebUrl = (index: number, value: string) => {
    const newUrls = [...webUrls];
    newUrls[index] = value;
    setWebUrls(newUrls);
  };

  const renderToolSpecificFields = () => {
    if (!selectedTool) return null;

    switch (selectedTool.type) {
      case "qdrant":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="collectionName">Collection Name *</Label>
              <Input
                id="collectionName"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g., vienna, salzburg, tyrol"
                required
              />
              <p className="text-xs text-muted-foreground">
                The Qdrant collection name this tool will search in
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLimit">Default Limit</Label>
                <Input
                  id="defaultLimit"
                  type="number"
                  min="1"
                  max="100"
                  value={defaultLimit}
                  onChange={(e) =>
                    setDefaultLimit(parseInt(e.target.value) || 5)
                  }
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFilter">Default Filter (JSON)</Label>
                <Input
                  id="defaultFilter"
                  value={defaultFilter}
                  onChange={(e) => setDefaultFilter(e.target.value)}
                  placeholder='{"category": "government"}'
                />
              </div>
            </div>
          </>
        );

      case "web":
        return (
          <>
            <div className="space-y-2">
              <Label>Website URLs *</Label>
              {webUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateWebUrl(index, e.target.value)}
                    placeholder="https://example.com"
                    required={index === 0}
                  />
                  {webUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeWebUrl(index)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWebUrl}
                className="w-full"
              >
                <PlusIcon className="mr-2 size-4" />
                Add Another URL
              </Button>
              <p className="text-xs text-muted-foreground">
                URLs that this tool will crawl and extract content from
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crawlDepth">Crawl Depth</Label>
              <Input
                id="crawlDepth"
                type="number"
                min="1"
                max="5"
                value={defaultLimit}
                onChange={(e) => setDefaultLimit(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                How many levels deep to crawl (1 = only the specified URLs)
              </p>
            </div>
          </>
        );

      case "search":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="searchQuery">Default Search Query *</Label>
              <Input
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Vienna government services"
                required
              />
              <p className="text-xs text-muted-foreground">
                Default search query for this tool
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchEngine">Search Engine</Label>
                <Select
                  value={searchEngine}
                  onValueChange={(value) => setSearchEngine(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="bing">Bing</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxResults">Max Results</Label>
                <Input
                  id="maxResults"
                  type="number"
                  min="1"
                  max="50"
                  value={defaultLimit}
                  onChange={(e) =>
                    setDefaultLimit(parseInt(e.target.value) || 10)
                  }
                  placeholder="10"
                />
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="defaultLimit">Default Limit</Label>
            <Input
              id="defaultLimit"
              type="number"
              min="1"
              max="100"
              value={defaultLimit}
              onChange={(e) => setDefaultLimit(parseInt(e.target.value) || 5)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Configuration for this tool type
            </p>
          </div>
        );
    }
  };

  const isFormValid = () => {
    if (!selectedToolId) return false;

    const tool = tools?.find((t) => t._id === selectedToolId);
    if (!tool) return false;

    switch (tool.type) {
      case "qdrant":
        return collectionName.trim() !== "";
      case "web":
        return webUrls.length > 0 && webUrls[0] && webUrls[0].trim() !== "";
      case "search":
        return searchQuery.trim() !== "";
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Tools</h3>
        {!assistantTools ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : assistantTools.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <WrenchIcon className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tools assigned</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {assistantTools.map((assignment: any) => {
              const IconComponent =
                toolTypeIcons[
                  assignment.tool.type as keyof typeof toolTypeIcons
                ] || toolTypeIcons.default;
              const colorClass =
                toolTypeColors[
                  assignment.tool.type as keyof typeof toolTypeColors
                ] || toolTypeColors.default;

              return (
                <Card key={assignment._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="size-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {assignment.tool.name}
                            </span>
                            <Badge className={colorClass}>
                              {assignment.tool.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.tool.type === "qdrant" &&
                              assignment.collectionName && (
                                <>Collection: {assignment.collectionName}</>
                              )}
                            {assignment.tool.type === "web" &&
                              assignment.urls && (
                                <>URLs: {assignment.urls.length} configured</>
                              )}
                            {assignment.tool.type === "search" &&
                              assignment.defaultQuery && (
                                <>Query: {assignment.defaultQuery}</>
                              )}
                            {assignment.defaultLimit &&
                              ` • Limit: ${assignment.defaultLimit}`}
                            {assignment.maxResults &&
                              ` • Max Results: ${assignment.maxResults}`}
                            {assignment.crawlDepth &&
                              ` • Crawl Depth: ${assignment.crawlDepth}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setDeletingAssignmentId(assignment._id)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign New Tool */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Assign New Tool</h3>
        <form onSubmit={handleAssignTool} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool">Select Tool</Label>
            <Select
              value={selectedToolId}
              onValueChange={(value) => setSelectedToolId(value as Id<"tools">)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a tool to assign" />
              </SelectTrigger>
              <SelectContent>
                {tools?.map((tool) => {
                  const IconComponent =
                    toolTypeIcons[tool.type as keyof typeof toolTypeIcons] ||
                    toolTypeIcons.default;
                  return (
                    <SelectItem key={tool._id} value={tool._id}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="size-4" />
                        <span>{tool.name}</span>
                        <Badge
                          className={
                            toolTypeColors[
                              tool.type as keyof typeof toolTypeColors
                            ] || toolTypeColors.default
                          }
                        >
                          {tool.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedTool && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Badge
                    className={
                      toolTypeColors[
                        selectedTool.type as keyof typeof toolTypeColors
                      ] || toolTypeColors.default
                    }
                  >
                    {selectedTool.type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {selectedTool.description || "No description available"}
                  </span>
                </div>
              </div>

              {renderToolSpecificFields()}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid()}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              <PlusIcon className="mr-2 size-4" />
              Assign Tool
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAssignmentId}
        onOpenChange={(open) => !open && setDeletingAssignmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tool Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tool assignment from the assistant. The tool
              itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveTool}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
