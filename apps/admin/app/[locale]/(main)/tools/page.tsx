/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
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
import { ToolForm } from "@/modules/tools/components/tool-form";
import {
  PlusIcon,
  EditIcon,
  Trash2Icon,
  WrenchIcon,
  Loader2,
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

function ToolCard({
  tool,
  onEdit,
  onDelete,
}: {
  tool: any;
  onEdit: (tool: any) => void;
  onDelete: (id: Id<"tools">) => void;
}) {
  const IconComponent =
    toolTypeIcons[tool.type as keyof typeof toolTypeIcons] ||
    toolTypeIcons.default;
  const colorClass =
    toolTypeColors[tool.type as keyof typeof toolTypeColors] ||
    toolTypeColors.default;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">{tool.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onEdit(tool)}
            >
              <EditIcon className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onDelete(tool._id)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge className={colorClass}>{tool.type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {new Date(tool._creationTime).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  const tools = useQuery(api.superadmin.tools.getAllTools);
  const deleteTool = useMutation(api.superadmin.tools.deleteTool);
  const seedQdrantTool = useMutation(api.superadmin.tools.seedQdrantTool);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<{
    id: Id<"tools">;
    name: string;
    description: string;
    type: string;
  } | null>(null);
  const [deletingToolId, setDeletingToolId] = useState<Id<"tools"> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleDelete = async () => {
    if (!deletingToolId) return;

    setIsDeleting(true);
    try {
      await deleteTool({ id: deletingToolId });
      setDeletingToolId(null);
    } catch (error) {
      console.error("Failed to delete tool:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedQdrantTool = async () => {
    setIsSeeding(true);
    try {
      await seedQdrantTool({});
    } catch (error) {
      console.error("Failed to seed Qdrant tool:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tools Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage tools that can be assigned to assistants
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedQdrantTool}
            disabled={isSeeding}
          >
            {isSeeding && <Loader2 className="mr-2 size-4 animate-spin" />}
            Seed Qdrant Tool
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 size-4" />
            Create Tool
          </Button>
        </div>
      </div>

      {/* Tools List */}
      {!tools ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : tools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WrenchIcon className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No tools yet</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              Create your first tool or seed the Qdrant search tool to get
              started
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSeedQdrantTool}
                disabled={isSeeding}
              >
                {isSeeding && <Loader2 className="mr-2 size-4 animate-spin" />}
                Seed Qdrant Tool
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="mr-2 size-4" />
                Create Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool._id}
              tool={tool}
              onEdit={(tool) =>
                setEditingTool({
                  id: tool._id,
                  name: tool.name,
                  description: tool.description,
                  type: tool.type,
                })
              }
              onDelete={(id) => setDeletingToolId(id)}
            />
          ))}
        </div>
      )}

      {/* Create Tool Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
            <DialogDescription>
              Configure a new tool that can be assigned to assistants
            </DialogDescription>
          </DialogHeader>
          <ToolForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tool Dialog */}
      <Dialog
        open={!!editingTool}
        onOpenChange={(open) => !open && setEditingTool(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription>
              Update the tool&apos;s configuration
            </DialogDescription>
          </DialogHeader>
          {editingTool && (
            <ToolForm
              initialData={editingTool}
              onSuccess={() => setEditingTool(null)}
              onCancel={() => setEditingTool(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingToolId}
        onOpenChange={(open) => !open && setDeletingToolId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tool. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
