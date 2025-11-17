import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Organization,
  User,
  InvitedUser,
  Assistant,
  OrganizationDetailsResponse,
  UsersResponse,
  InvitedUsersResponse,
} from "../types/municipality.types";

/**
 * Custom hook for fetching municipality data including organization details, users, and invited users
 */
export const useMunicipalityData = (municipalityId: string) => {
  const [organizationDetails, setOrganizationDetails] =
    useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convex actions for one-off data fetching
  const getOrganizationDetails = useAction(
    api.superadmin.organization.getOrganizationDetails
  );
  const getUsersByOrganization = useAction(
    api.superadmin.users.getUsersByOrganization
  );
  const getInvitedUsers = useAction(
    api.superadmin.users.getInvitedUsersByOrganization
  );

  /**
   * Loads the organization details, users, and invited users using Convex actions.
   */
  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get organization details
      const orgResult: OrganizationDetailsResponse =
        await getOrganizationDetails({
          organizationId: municipalityId,
        });
      if (orgResult.success && orgResult.organization) {
        setOrganizationDetails(orgResult.organization);
      } else {
        const errorMsg =
          orgResult.error || "Failed to fetch organization details";
        throw new Error(errorMsg);
      }

      // Get users
      const usersResult: UsersResponse = await getUsersByOrganization({
        organizationId: municipalityId,
      });
      if (usersResult.success) {
        setUsers(usersResult.users || []);
      }

      // Get invited users
      const invitedResult: InvitedUsersResponse = await getInvitedUsers({
        organizationId: municipalityId,
      });
      if (invitedResult.success) {
        setInvitedUsers(invitedResult.invitedUsers || []);
      }
    } catch (err) {
      console.error("Error loading organization data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while loading data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Effect for action-based data loading
  useEffect(() => {
    loadOrganizationData();
  }, [municipalityId, getOrganizationDetails, getUsersByOrganization, getInvitedUsers]);

  return {
    organizationDetails,
    users,
    invitedUsers,
    loading,
    error,
    refetch: loadOrganizationData,
  };
};

/**
 * Custom hook for fetching assistants assigned to a municipality
 */
export const useMunicipalityAssistants = (municipalityId: string) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  // Convex query for real-time assistant data
  const assignedAssistants = useQuery(
    api.superadmin.assistant.getAssistantByOrganization,
    { municipalityId: municipalityId }
  ) as Assistant[] | undefined;

  // Effect for real-time data query (Assistants)
  useEffect(() => {
    if (assignedAssistants) {
      setAssistants(assignedAssistants);
    }
  }, [assignedAssistants]);

  return {
    assistants,
    isLoading: assignedAssistants === undefined,
  };
};

