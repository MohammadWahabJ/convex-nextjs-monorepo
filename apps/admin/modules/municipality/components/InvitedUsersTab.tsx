import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Mail } from "lucide-react";
import { InvitedUsersTabProps } from "../types/municipality.types";
import { formatDate } from "../utils/municipality.utils";

export function InvitedUsersTab({
  invitedUsers,
  getRoleBadgeColor,
  getStatusBadgeColor,
}: InvitedUsersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Pending Invitations ({invitedUsers.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitedUsers.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending invitations
            </h3>
            <p className="text-sm text-gray-500">
              All invitations have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitedUsers.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{invitation.emailAddress}</div>
                    <div className="text-sm text-gray-500">
                      Invited {formatDate(invitation.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleBadgeColor(invitation.role)}>
                    {invitation.role}
                  </Badge>
                  <Badge
                    className={getStatusBadgeColor(
                      invitation.status || "unknown"
                    )}
                  >
                    {invitation.status || "Unknown"}
                  </Badge>
                  {/* <div className="text-xs text-gray-500">
                    Expires {formatDate(invitation.expiresAt)}
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
