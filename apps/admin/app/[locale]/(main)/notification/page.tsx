"use client";

import React, { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Bell, Plus, X, Loader2 } from "lucide-react";
import {
  // Types
  // Notification,
  NotificationFilters,
  // Hooks
  useNotifications,
  useOrganizations,
  useNotificationFilters,
  // Components
  CreateNotificationModal,
  NotificationTable,
  NotificationFiltersComponent,
} from "@/modules/notification";

function NotificationContent() {
  const allNotifications = useNotifications();
  const { organizations, loading: isLoadingOrganizations } = useOrganizations();

  // Filter states
  const [filters, setFilters] = useState<NotificationFilters>({
    searchTerm: "",
    typeFilter: "all",
    organizationFilter: "all",
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered notifications
  const notifications = useNotificationFilters(allNotifications, filters);

  // Filter management
  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      typeFilter: "all",
      organizationFilter: "all",
    });
  };

  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.typeFilter !== "all" ||
    filters.organizationFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight truncate">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage system notifications and announcements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4 sm:gap-0">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="">
          <NotificationFiltersComponent
            filters={filters}
            onFiltersChange={updateFilters}
            organizations={organizations}
            isLoadingOrganizations={isLoadingOrganizations}
            hasActiveFilters={hasActiveFilters}
          />
        </CardContent>
      </Card>

      {/* Content */}
      {allNotifications === undefined ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold">Loading notifications...</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we fetch the notification data
            </p>
          </CardContent>
        </Card>
      ) : notifications && notifications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              All Notifications ({notifications.length}
              {allNotifications &&
                notifications.length !== allNotifications.length &&
                ` of ${allNotifications.length}`}
              )
            </CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? "Filtered list of system notifications"
                : "Complete list of system notifications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationTable notifications={notifications} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {hasActiveFilters
                ? "No notifications match your filters"
                : "No notifications found"}
            </h3>
            <p className="text-muted-foreground text-center">
              {hasActiveFilters
                ? "Try adjusting your search criteria or clear filters to see all notifications"
                : "No notifications have been created yet"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <CreateNotificationModal
        open={showCreateModal}
        setOpen={setShowCreateModal}
        onOpenChange={setShowCreateModal}
        organizations={organizations}
      />
    </div>
  );
}

function Page() {
  return (
    <>
      <Authenticated>
        <NotificationContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default Page;
