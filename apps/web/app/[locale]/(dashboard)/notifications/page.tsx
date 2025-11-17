"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Bell,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { formatDistanceToNow } from "date-fns";

type NotificationType = "update" | "info" | "error" | "alert";

interface Notification {
  _id: string;
  _creationTime: number;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  createdBy?: string;
  assignmentId: string;
  assignedRole?: string;
  assignedAt: number;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "update":
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationBadgeVariant = (type: NotificationType) => {
  switch (type) {
    case "update":
      return "secondary" as const;
    case "info":
      return "outline" as const;
    case "error":
      return "destructive" as const;
    case "alert":
      return "default" as const;
    default:
      return "outline" as const;
  }
};

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const notifications = useQuery(
    api.web.notifications.getNotificationsByOrganization
  );

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <div className="h-full w-full">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with important announcements and system
              notifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {notifications && (
              <Badge variant="secondary">
                {notifications.length} notifications
              </Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications === undefined ? (
            // Loading state
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center">
                  You&apos;re all caught up! New notifications will appear here when
                  they&apos;re available.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Notifications list
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">
                          {notification.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(
                              new Date(notification._creationTime),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                          {notification.assignedRole && (
                            <>
                              <span>•</span>
                              <span className="capitalize">
                                {notification.assignedRole.replace("org:", "")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={getNotificationBadgeVariant(notification.type)}
                    >
                      {notification.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <ExternalLink className="h-3 w-3" />
                      <span>Click to view details</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notification Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedNotification &&
                    getNotificationIcon(selectedNotification.type)}
                  <DialogTitle className="text-xl">
                    {selectedNotification?.title}
                  </DialogTitle>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {selectedNotification &&
                      formatDistanceToNow(
                        new Date(selectedNotification._creationTime),
                        { addSuffix: true }
                      )}
                  </span>
                </div>
                {selectedNotification && (
                  <Badge
                    variant={getNotificationBadgeVariant(
                      selectedNotification.type
                    )}
                  >
                    {selectedNotification.type}
                  </Badge>
                )}
                {selectedNotification?.assignedRole && (
                  <Badge variant="outline">
                    {selectedNotification.assignedRole.replace("org:", "")}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedNotification?.message}
                </p>
              </div>

              {selectedNotification?.createdBy && (
                <div>
                  <h4 className="font-medium mb-2">Created by</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.createdBy}
                  </p>
                </div>
              )}

              {selectedNotification?.actionUrl && (
                <div className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <a
                      href={selectedNotification.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Action Link
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
