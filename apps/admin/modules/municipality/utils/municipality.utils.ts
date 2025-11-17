/**
 * Utility functions for municipality-related components
 */

/**
 * Returns the appropriate CSS classes for role badges based on role type
 */
export const getRoleBadgeColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case "admin":
    case "org:admin":
      return "bg-red-100 text-red-800";
    case "member":
    case "org:member":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Returns the appropriate CSS classes for status badges based on status type
 */
export const getStatusBadgeColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "revoked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Formats a date number timestamp to a localized date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Gets user display name from user object
 */
export const getUserDisplayName = (user: {
  firstName: string | null;
  lastName: string | null;
  identifier: string;
}): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.identifier || "Unknown User";
};

/**
 * Gets user initials for avatar fallback
 */
export const getUserInitials = (user: {
  firstName: string | null;
  lastName: string | null;
  identifier: string;
}): string => {
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  return user.identifier?.charAt(0)?.toUpperCase() || "U";
};