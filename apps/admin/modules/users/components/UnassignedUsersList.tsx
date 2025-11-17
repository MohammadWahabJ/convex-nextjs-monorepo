import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Mail, Users } from "lucide-react";
import { useState } from "react";

interface UnassignedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  createdAt: number;
  acceptedInvitationsCount: number;
}

interface SystemInvitation {
  id: string;
  emailAddress: string;
  createdAt: number;
  publicMetadata: Record<string, any>;
}

interface UnassignedUsersListProps {
  unassignedUsers: UnassignedUser[];
  unassignedInvitations: SystemInvitation[];
  formatUserDisplayName: (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => string;
  onAssignRole?: (userId: string) => void;
  onResendInvitation?: (invitationId: string) => void;
  onUserRoleAssigned?: () => void; // New callback for when role is assigned
}

export function UnassignedUsersList({
  unassignedUsers,
  unassignedInvitations,
  formatUserDisplayName,
  onAssignRole,
  onResendInvitation,
  onUserRoleAssigned,
}: UnassignedUsersListProps) {
  const [selectedUser, setSelectedUser] = useState<UnassignedUser | null>(null);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);

  const handleAssignRoleClick = (user: UnassignedUser) => {
    setSelectedUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleRoleAssignSuccess = () => {
    setIsAssignRoleModalOpen(false);
    setSelectedUser(null);
    onUserRoleAssigned?.(); // Call parent callback to refresh data
  };

  const hasUsers =
    unassignedUsers.length > 0 || unassignedInvitations.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-600" />
          Invited Management Users
        </CardTitle>
        <CardDescription>
          Users who have been invited but haven't been accept invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasUsers ? (
          <div className="text-center py-8">
            <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No pending users
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show unassigned users who have accepted invitations */}
            {unassignedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-300 dark:text-orange-300" />
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
              </div>
            ))}

            {/* Show pending invitations without roles */}
            {unassignedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {invitation.emailAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Invited{" "}
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 dark:text-yellow-400 dark:border-yellow-600"
                  >
                    Pending Invitation
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => onResendInvitation?.(invitation.id)}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
