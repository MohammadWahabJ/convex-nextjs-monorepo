import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Eye, Edit, Trash } from "lucide-react";
import { Notification } from "../../types";
import {
  getTypeColor,
  getTypeIcon,
  formatDate,
  truncateText,
} from "../../utils";
import { UI_CONSTANTS } from "../../constants";
import { DeleteNotificationModal } from "./DeleteNotificationModal";

interface NotificationTableProps {
  notifications: Notification[];
  onRefresh?: () => void;
}

interface NotificationRowProps {
  notification: Notification;
  onDelete?: (notification: Notification) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onDelete,
}) => {
  const IconComponent = getTypeIcon(notification.type);

  const handleDeleteClick = () => {
    onDelete?.(notification);
  };

  return (
    <TableRow key={notification._id}>
      <TableCell className="w-[120px]">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          <Badge
            variant={getTypeColor(notification.type)}
            className="capitalize"
          >
            {notification.type}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="min-w-[200px] max-w-[300px]">
        <div
          className="font-medium break-words hyphens-auto"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            lineHeight: "1.4",
          }}
          title={notification.title}
        >
          {truncateText(notification.title, UI_CONSTANTS.TRUNCATE_LENGTH.TITLE)}
        </div>
      </TableCell>
      <TableCell className="min-w-[250px] max-w-[400px]">
        <div
          className="text-sm text-muted-foreground break-words hyphens-auto"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            lineHeight: "1.4",
            maxHeight: "3.6em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
          title={notification.message}
        >
          {notification.message}
        </div>
      </TableCell>
      <TableCell className="w-[80px]">
        <div
          className="text-sm font-mono font-medium text-center"
          title={`Country: ${notification.countryCode}`}
        >
          {notification.countryCode}
        </div>
      </TableCell>
      <TableCell className="w-[120px]">
        <div
          className="text-sm break-words"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          title={notification.createdBy || "System"}
        >
          {notification.createdBy
            ? truncateText(
                notification.createdBy,
                UI_CONSTANTS.TRUNCATE_LENGTH.CREATOR_NAME
              )
            : "System"}
        </div>
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="text-sm whitespace-nowrap">
          {formatDate(notification.createdAt)}
        </div>
      </TableCell>
      <TableCell className="w-[120px]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDeleteClick}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const NotificationTable: React.FC<NotificationTableProps> = ({
  notifications,
  onRefresh,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    React.useState<Notification | null>(null);

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setNotificationToDelete(null);
    onRefresh?.(); // Refresh the notifications list
  };

  const handleDeleteModalClose = (open: boolean) => {
    setDeleteModalOpen(open);
    if (!open) {
      setNotificationToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="min-w-[200px] max-w-[300px]">
                Title
              </TableHead>
              <TableHead className="min-w-[250px] max-w-[400px]">
                Message
              </TableHead>
              <TableHead className="w-[80px]">Country</TableHead>
              <TableHead className="w-[120px]">Created By</TableHead>
              <TableHead className="w-[140px]">Created</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <NotificationRow
                key={notification._id}
                notification={notification}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteNotificationModal
        notification={notificationToDelete}
        isOpen={deleteModalOpen}
        onOpenChange={handleDeleteModalClose}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};
