import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Notification, NotificationAssignment, NotificationFilters, Organization } from "../types";

export const useNotifications = () => {
  return useQuery(api.superadmin.notification.getAllNotificationsWithOrganizations, {});
};

export const useOrganizations = () => {
  const organizationsData = useQuery(api.superadmin.organization.getAllOrganizationsWithRole, { activeOnly: true });
  
  return {
    organizations: organizationsData?.organizations || [],
    loading: organizationsData === undefined,
    error: organizationsData?.success === false ? organizationsData.error || "Failed to load organizations" : null,
  };
};

export const useOrganizationsByCountry = (countryCode?: string) => {
  const organizationsData = useQuery(
    api.superadmin.organization.getOrganizationsByCountry,
    countryCode
      ? { countryCode, activeOnly: true }
      : "skip"
  );
  
  return {
    organizations: organizationsData?.organizations || [],
    loading: organizationsData === undefined && countryCode !== undefined,
    error: organizationsData?.success === false ? organizationsData.error || "Failed to load organizations" : null,
  };
};

export const useCountries = () => {
  const countriesData = useQuery(api.superadmin.country.getAllCountries);
  
  // Handle the different return types from getAllCountries
  let countries: Array<{
    _id: string;
    code: string;
    name: string;
    shortName?: string;
  }> = [];
  
  let error: string | null = null;
  
  if (countriesData) {
    if (Array.isArray(countriesData)) {
      // Direct array of countries (successful response)
      countries = countriesData;
    } else if (
      "success" in countriesData &&
      "countries" in countriesData
    ) {
      // Error response object
      error = countriesData.error || "Failed to load countries";
    }
  }
  
  return {
    countries,
    loading: countriesData === undefined,
    error,
  };
};

export const useNotificationFilters = (
  notifications: any[] | undefined,
  filters: NotificationFilters
) => {
  return useMemo(() => {
    if (!notifications) return notifications;

    return notifications.filter((notification) => {
      // Search term filter
      const matchesSearch =
        filters.searchTerm === "" ||
        notification.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (notification.createdBy &&
          notification.createdBy.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Type filter
      const matchesType =
        filters.typeFilter === "all" || notification.type === filters.typeFilter;

      // Organization filter
      const matchesOrganization = (() => {
        if (filters.organizationFilter === "all") return true;

        if (filters.organizationFilter === "unassigned") {
          return (
            !notification.organization_assignments ||
            notification.organization_assignments.length === 0
          );
        }

        if (
          notification.organization_assignments &&
          notification.organization_assignments.length > 0
        ) {
          return notification.organization_assignments.some(
            (assignment: NotificationAssignment) => assignment.organizationId === filters.organizationFilter
          );
        }

        return false;
      })();

      return matchesSearch && matchesType && matchesOrganization;
    });
  }, [notifications, filters]);
};