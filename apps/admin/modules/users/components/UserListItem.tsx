import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Shield, UserCheck, Mail, Globe } from "lucide-react";

interface UserListItemProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{
      emailAddress: string;
      id: string;
    }>;
    lastSignInAt: number | null;
    publicMetadata: Record<string, any>;
  };
  type: "super_admin" | "moderator";
  formatUserDisplayName: (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => string;
  getRoleBadgeColor: (role: string) => string;
  getSystemRoleDisplayName: (role: "super_admin" | "moderator") => string;
}

export function UserListItem({
  user,
  type,
  formatUserDisplayName,
  getRoleBadgeColor,
  getSystemRoleDisplayName,
}: UserListItemProps) {
  const IconComponent = type === "super_admin" ? Shield : UserCheck;
  const iconColor = type === "super_admin" ? "text-red-600" : "text-blue-600";

  // Get country code for moderators
  const countryCode =
    type === "moderator" ? user.publicMetadata?.countryCode : null;

  // Helper function to get country display name
  const getCountryDisplay = (code: string) => {
    const countryMap: Record<string, string> = {
      RO: "Romania",
      TU: "Turkey",
      UAE: "UAE",
    };
    return countryMap[code] || code;
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <IconComponent className={`h-5 w-5 ${iconColor}`} />
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formatUserDisplayName(
              user.firstName,
              user.lastName,
              user.emailAddresses[0]?.emailAddress || "Unknown User"
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={getRoleBadgeColor(type)}>
          {getSystemRoleDisplayName(type)}
        </Badge>
        {countryCode && (
          <Badge
            variant="outline"
            className="flex items-center gap-1"
            title={getCountryDisplay(countryCode)}
          >
            <Globe className="h-3 w-3" />
            {countryCode}
          </Badge>
        )}
        {user.lastSignInAt && (
          <span className="text-xs text-muted-foreground">
            Last active: {new Date(user.lastSignInAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
