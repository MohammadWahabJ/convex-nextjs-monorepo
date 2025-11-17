import { Badge } from "@workspace/ui/components/badge";
import { Mail, Clock, Globe } from "lucide-react";

interface PendingInvitationsProps {
  invitations: Array<{
    id: string;
    emailAddress: string;
    createdAt: number;
    publicMetadata: Record<string, any>;
  }>;
  title: string;
}

export function PendingInvitations({
  invitations,
  title,
}: PendingInvitationsProps) {
  if (invitations.length === 0) return null;

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
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Clock className="h-4 w-4" />
        {title}
      </h4>
      <div className="space-y-2">
        {invitations.map((invitation) => {
          const countryCode = invitation.publicMetadata?.countryCode;
          const managementRole = invitation.publicMetadata?.managementRole;

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {invitation.emailAddress}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invited{" "}
                    {new Date(invitation.createdAt).toLocaleDateString()}
                    {managementRole &&
                      ` • ${managementRole === "super_admin" ? "Super Admin" : "Moderator"}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {countryCode && managementRole === "moderator" && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                    title={getCountryDisplay(countryCode)}
                  >
                    <Globe className="h-3 w-3" />
                    {countryCode}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
