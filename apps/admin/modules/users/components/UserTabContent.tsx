import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Shield, UserCheck } from "lucide-react";
import { UserListItem } from "./UserListItem";
import { PendingInvitations } from "./PendingInvitations";

interface SystemUser {
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

interface SystemInvitation {
  id: string;
  emailAddress: string;
  status: string | undefined;
  createdAt: number;
  publicMetadata: Record<string, any>;
}

interface UserTabContentProps {
  type: "super_admin" | "moderator";
  users: SystemUser[];
  invitations: SystemInvitation[];
  formatUserDisplayName: (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => string;
  getRoleBadgeColor: (role: string) => string;
  getSystemRoleDisplayName: (role: "super_admin" | "moderator") => string;
}

export function UserTabContent({
  type,
  users,
  invitations,
  formatUserDisplayName,
  getRoleBadgeColor,
  getSystemRoleDisplayName,
}: UserTabContentProps) {
  const isSuper = type === "super_admin";
  const IconComponent = isSuper ? Shield : UserCheck;
  const iconColor = isSuper ? "text-red-600" : "text-blue-600";
  const title = isSuper ? "Super Administrators" : "Moderation Users";
  const description = isSuper
    ? "Users with complete system access and administrative privileges"
    : "Users with content moderation and monitoring privileges";
  const emptyTitle = isSuper
    ? "No super admins found"
    : "No moderation users found";
  const emptyDescription = isSuper
    ? "Invite super administrators to manage the system"
    : "Invite moderation users to help manage content";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              type={type}
              formatUserDisplayName={formatUserDisplayName}
              getRoleBadgeColor={getRoleBadgeColor}
              getSystemRoleDisplayName={getSystemRoleDisplayName}
            />
          ))}
        </div>

        <PendingInvitations
          invitations={invitations}
          title="Pending Invitations"
        />

        {users.length === 0 && invitations.length === 0 && (
          <div className="text-center py-8">
            <IconComponent className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {emptyTitle}
            </h3>
            <p className="text-muted-foreground text-center">
              {emptyDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
