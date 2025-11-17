"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { ConvexError } from "convex/values";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Loader2, AlertTriangle, Trash2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";

interface DeleteAssistantDialogProps {
  assistantId: Id<"assistants"> | null;
  assistantName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteAssistantDialog({
  assistantId,
  assistantName,
  onClose,
  onSuccess,
}: DeleteAssistantDialogProps) {
  // Get assistant data to check its current state
  const assistant = useQuery(
    api.superadmin.assistant.getAssistantById,
    assistantId ? { id: assistantId } : "skip"
  );

  const deactivateAssistant = useMutation(
    api.superadmin.assistant.deactivateAssistant
  );
  const deleteAssistant = useMutation(api.superadmin.assistant.deleteAssistant);

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivationResult, setDeactivationResult] = useState<{
    deactivated: boolean;
    unassigned: boolean;
  } | null>(null);
  const [deletionResult, setDeletionResult] = useState<{
    deletedAssistant: boolean;
    deletedMunicipalityAssignments: number;
    deletedConversations: number;
    deletedToolConfigurations: number;
  } | null>(null);

  // Check if assistant is already deactivated (inactive and unassigned)
  const isAlreadyDeactivated =
    assistant && !assistant.isActive && !assistant.organizationId;

  const handleDelete = async () => {
    if (!assistantId) return;

    setIsDeleting(true);
    setError(null);

    try {
      if (isAlreadyDeactivated) {
        // Permanently delete the assistant
        const result = await deleteAssistant({ id: assistantId });
        setDeletionResult(result);
        onSuccess?.();
        // Auto-close after 3 seconds to show the result
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        // Deactivate and unassign the assistant
        const result = await deactivateAssistant({ id: assistantId });
        setDeactivationResult(result);
        onSuccess?.();
        // Auto-close after 2 seconds to show the result
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to process assistant deletion:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    // This function is no longer needed, but keeping for compatibility
    // Just redirect to regular delete
    await handleDelete();
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={!!assistantId}
      onOpenChange={(open) => {
        // Only allow closing if no error and not deleting
        if (!open && !error && !isDeleting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click when there's an error
          if (error || isDeleting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAlreadyDeactivated ? (
              <>
                <Trash2 className="h-5 w-5 text-destructive" />
                Permanently Delete Assistant
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Deactivate Assistant
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {assistantName ? (
            <div className="space-y-3">
              <div>
                <Badge
                  variant={isAlreadyDeactivated ? "secondary" : "default"}
                  className="text-xs"
                >
                  {isAlreadyDeactivated
                    ? "Already Deactivated"
                    : "Currently Active"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {isAlreadyDeactivated ? (
                  <>
                    Are you sure you want to{" "}
                    <strong className="text-destructive">
                      permanently delete
                    </strong>{" "}
                    <strong>"{assistantName}"</strong>? This action is{" "}
                    <strong className="text-destructive">irreversible</strong>{" "}
                    and will remove all associated data.
                  </>
                ) : (
                  <>
                    Are you sure you want to deactivate{" "}
                    <strong>"{assistantName}"</strong>? This will unassign it
                    from the organization and make it inactive. The assistant
                    can be reactivated later.
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Badge
                  variant={isAlreadyDeactivated ? "secondary" : "default"}
                  className="text-xs"
                >
                  {isAlreadyDeactivated
                    ? "Already Deactivated"
                    : "Currently Active"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {isAlreadyDeactivated ? (
                  <>
                    Are you sure you want to{" "}
                    <strong className="text-destructive">
                      permanently delete
                    </strong>{" "}
                    this assistant? This action is{" "}
                    <strong className="text-destructive">irreversible</strong>{" "}
                    and will remove all associated data.
                  </>
                ) : (
                  <>
                    Are you sure you want to deactivate this assistant? This
                    will unassign it from the organization and make it inactive.
                    The assistant can be reactivated later.
                  </>
                )}
              </div>
            </div>
          )}

          <div
            className={`p-3 rounded-md text-xs border ${
              isAlreadyDeactivated
                ? "bg-destructive/5 border-destructive/20"
                : "bg-orange-50 border-orange-200"
            }`}
          >
            <div
              className={`font-semibold ${
                isAlreadyDeactivated ? "text-destructive" : "text-orange-700"
              }`}
            >
              {isAlreadyDeactivated
                ? "⚠️ Permanent deletion will:"
                : "ℹ️ Deactivation will:"}
            </div>
            <ul
              className={`mt-2 space-y-1 ${
                isAlreadyDeactivated ? "text-destructive/80" : "text-orange-600"
              }`}
            >
              {isAlreadyDeactivated ? (
                <>
                  <li>• Delete the assistant permanently</li>
                  <li>• Remove all municipality assignments</li>
                  <li>• Delete all conversations and chat history</li>
                  <li>• Remove all tool configurations</li>
                  <li className="font-medium mt-2 text-destructive">
                    ⚠️ This action cannot be undone!
                  </li>
                </>
              ) : (
                <>
                  <li>• Set isActive to false</li>
                  <li>• Remove organizationId (unassign from organization)</li>
                  <li>• Keep all data for potential reactivation</li>
                  <li className="font-medium mt-2 text-orange-700">
                    ✓ Can be permanently deleted in a second step
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {deactivationResult && (
          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <div className="font-medium">
                  Assistant successfully deactivated!
                </div>
                <div className="text-sm">
                  The assistant has been unassigned from the organization and
                  set to inactive. You can now permanently delete it if needed.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {deletionResult && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div className="font-medium">
                  Assistant permanently deleted!
                </div>
                <div className="text-sm space-y-1">
                  {deletionResult.deletedMunicipalityAssignments > 0 && (
                    <div>
                      • Removed {deletionResult.deletedMunicipalityAssignments}{" "}
                      municipality assignment(s)
                    </div>
                  )}
                  {deletionResult.deletedConversations > 0 && (
                    <div>
                      • Removed {deletionResult.deletedConversations}{" "}
                      conversation(s)
                    </div>
                  )}
                  {deletionResult.deletedToolConfigurations > 0 && (
                    <div>
                      • Removed {deletionResult.deletedToolConfigurations} tool
                      configuration(s)
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-6">
          {deletionResult ? (
            <Button
              variant="secondary"
              onClick={() => {
                setDeletionResult(null);
                setDeactivationResult(null);
                onClose();
              }}
            >
              Close
            </Button>
          ) : deactivationResult ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setDeactivationResult(null);
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!assistantId) return;
                  setIsDeleting(true);
                  setDeactivationResult(null); // Clear deactivation result
                  try {
                    const result = await deleteAssistant({ id: assistantId });
                    setDeletionResult(result);
                    onSuccess?.();
                    // Auto-close after 3 seconds to show the result
                    setTimeout(() => {
                      onClose();
                    }, 3000);
                  } catch (err) {
                    console.error(
                      "Failed to permanently delete assistant:",
                      err
                    );
                    setError(
                      err instanceof Error
                        ? err.message
                        : "An unexpected error occurred. Please try again."
                    );
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Trash2 className="mr-2 h-4 w-4" />
                Permanently Delete
              </Button>
            </>
          ) : error ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  onClose();
                }}
              >
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (!isDeleting) {
                    setError(null);
                    onClose();
                  }
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant={isAlreadyDeactivated ? "destructive" : "default"}
                onClick={handleDelete}
                disabled={isDeleting}
                className={
                  isAlreadyDeactivated
                    ? ""
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isAlreadyDeactivated ? (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Permanently Delete
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Deactivate Assistant
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
