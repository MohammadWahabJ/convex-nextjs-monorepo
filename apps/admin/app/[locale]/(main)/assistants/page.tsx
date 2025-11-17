"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { AssistantCard } from "@/modules/assistants/components/assistant-card";
import { DeleteAssistantDialog } from "@/modules/assistants/components/delete-assistant-dialog";
import { CreateAssistantDialog } from "@/modules/assistants/components/create-assistant-dialog";
import { EditAssistantDialog } from "@/modules/assistants/components/edit-assistant-dialog";
import { PlusIcon, BotIcon, Loader2 } from "lucide-react";
import { AssistantType } from "@/modules/assistants/types";
import { SuperAdminGuard } from "@/components/super-admin-guard";

const AssistantsPage = () => {
  const assistants = useQuery(
    api.superadmin.assistant.getAllAssistantsWithRole,
    { activeOnly: true }
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] =
    useState<AssistantType | null>(null);
  const [deletingAssistant, setDeletingAssistant] = useState<{
    id: Id<"assistants">;
    name: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistants</h1>
          <p className="text-muted-foreground">
            Create and manage AI assistants with custom configurations
          </p>
        </div>
        <SuperAdminGuard>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 size-4" />
            Create Assistant
          </Button>
        </SuperAdminGuard>
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
            <h3 className="mb-2 font-semibold text-lg">No assistants yet</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              Create your first AI assistant to get started
            </p>
            <SuperAdminGuard>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="mr-2 size-4" />
                Create Assistant
              </Button>
            </SuperAdminGuard>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assistants.map((assistant) => (
            <AssistantCard
              key={assistant._id}
              assistant={assistant}
              onEdit={(assistant) => setEditingAssistant(assistant)}
              onDelete={(assistant) => setDeletingAssistant(assistant)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateAssistantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditAssistantDialog
        assistant={editingAssistant}
        onClose={() => setEditingAssistant(null)}
      />

      <DeleteAssistantDialog
        assistantId={deletingAssistant?.id || null}
        assistantName={deletingAssistant?.name}
        onClose={() => setDeletingAssistant(null)}
        onSuccess={() => {
          // Optional: Add success feedback here
        }}
      />
    </div>
  );
};

export default AssistantsPage;
