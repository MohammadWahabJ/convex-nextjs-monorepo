"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Loader2 } from "lucide-react";
import {
  CreateNotificationModalProps,
  NotificationFormData,
} from "../../types";
import { UI_CONSTANTS } from "../../constants";
import { NotificationDetailsForm } from "./NotificationDetailsForm";
import { OrganizationAssignment } from "./OrganizationAssignment";
import { useCountries } from "../../hooks";

export function CreateNotificationModal({
  open,
  setOpen,
  onOpenChange,
  organizations = [],
  onNotificationCreated,
}: CreateNotificationModalProps) {
  const { countries } = useCountries();

  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    type: "info",
    actionUrl: "",
    createdBy: "Super Admin",
    selectedOrganizations: [],
    assignToAll: false,
    accessRole: "org:member",
    selectedCountryId: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotification = useMutation(
    api.superadmin.notification.createNotification
  );
  const assignNotificationToOrganization = useMutation(
    api.superadmin.notification.assignNotificationToOrganization
  );
  const assignNotificationToMultipleOrganizations = useMutation(
    api.superadmin.notification.assignNotificationToMultipleOrganizations
  );

  const updateFormData = (data: Partial<NotificationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      actionUrl: "",
      createdBy: "",
      selectedOrganizations: [],
      assignToAll: false,
      accessRole: "org:member",
      selectedCountryId: undefined,
    });
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Title and message are required");
      return;
    }

    if (!formData.assignToAll && formData.selectedOrganizations.length === 0) {
      setError(
        "Please select at least one organization or assign to all organizations"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the selected country code from the form data
      const selectedCountry = formData.selectedCountryId 
        ? countries.find(country => country._id === formData.selectedCountryId)
        : null;
      
      const countryCode = selectedCountry?.code || "RO"; // Default to Romania if no country selected

      const notificationId = await createNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        countryCode: countryCode,
        type: formData.type,
        actionUrl: formData.actionUrl.trim() || undefined,
        createdBy: formData.createdBy.trim() || undefined,
      });

      // Handle organization assignments
      if (formData.assignToAll) {
        // If a country is selected, use all organizations from that country
        // Otherwise, use all organizations from props
        const relevantOrganizations = formData.selectedCountryId
          ? [] // This will be handled by the backend based on country
          : organizations;
        const allOrgIds = relevantOrganizations.map((org) => org.id);
        if (allOrgIds.length > 0) {
          await assignNotificationToMultipleOrganizations({
            notificationId: notificationId,
            organizationIds: allOrgIds,
            role: formData.accessRole,
          });
        }
      } else if (formData.selectedOrganizations.length > 0) {
        const validOrgIds = formData.selectedOrganizations.filter(
          (id): id is string => typeof id === "string" && id.length > 0
        );

        if (validOrgIds.length === 1) {
          await assignNotificationToOrganization({
            notificationId: notificationId,
            organizationId: validOrgIds[0]!,
            role: formData.accessRole,
          });
        } else if (validOrgIds.length > 1) {
          await assignNotificationToMultipleOrganizations({
            notificationId: notificationId,
            organizationIds: validOrgIds,
            role: formData.accessRole,
          });
        }
      }

      setSuccess(true);
      onNotificationCreated?.();

      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, UI_CONSTANTS.SUCCESS_TIMEOUT);
    } catch (err) {
      console.error("Failed to create notification:", err);
      setError("Failed to create notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
      setSuccess(false);
    }
  };

  if (!open) return null;

  const isFormValid =
    formData.title.trim() &&
    formData.message.trim() &&
    (formData.assignToAll || formData.selectedOrganizations.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pr-12">
          <DialogTitle className="text-2xl font-bold">
            Create Notification
          </DialogTitle>
          <DialogDescription>
            Create a new system notification and assign it to organizations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 mt-2 pb-6">
            <NotificationDetailsForm
              formData={formData}
              onFormDataChange={updateFormData}
            />

            <OrganizationAssignment
              formData={formData}
              onFormDataChange={updateFormData}
              organizations={organizations}
            />

            {/* Error Message */}
            {error && (
              <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded break-words">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded">
                Notification created successfully!
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Notification"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
