import React from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";
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
import { Button } from "@workspace/ui/components/button";
import { Loader2, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";
import { Notification } from "../../types";

interface DeleteNotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteNotificationModal: React.FC<
  DeleteNotificationModalProps
> = ({ notification, isOpen, onOpenChange, onSuccess }) => {
  const deleteNotification = useMutation(
    api.superadmin.notification.deleteNotification
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!notification) return;

    try {
      setIsDeleting(true);

      const result = await deleteNotification({
        id: notification._id as Id<"notifications">,
      });

      toast.success(
        `Notification deleted successfully. Removed ${result.deletedAssignments} organization assignments.`
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </div>
            {notification && (
              <div className="bg-muted p-3 rounded-md space-y-1">
                <div className="font-medium text-sm">{notification.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </div>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              This will also remove all organization assignments for this
              notification.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Notification"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
