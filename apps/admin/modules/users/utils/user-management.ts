// Utility functions for user management
export type SystemUserRole = "super_admin" | "moderator";

export const getSystemRoleBadgeColor = (role: SystemUserRole): string => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "moderator":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

export const getSystemRoleDisplayName = (role: SystemUserRole): string => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "moderator":
      return "Moderator";
    default:
      return "Unknown Role";
  }
};

export const formatUserDisplayName = (
  firstName: string | null,
  lastName: string | null,
  email: string
): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return email;
};

// Types for user management
export interface SystemUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  publicMetadata: Record<string, any>;
}

export interface SystemInvitation {
  id: string;
  emailAddress: string;
  status: string | undefined;
  createdAt: number;
  publicMetadata: Record<string, any>;
}

export interface UnassignedUser extends SystemUser {
  acceptedInvitationsCount: number;
}