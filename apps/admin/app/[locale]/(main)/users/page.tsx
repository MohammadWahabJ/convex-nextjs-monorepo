"use client";

import { Authenticated, Unauthenticated, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Users, Shield, UserCheck } from "lucide-react";
import { InviteModerationDialog } from "@/modules/users/components/inviteManagementUsersModal";
import { useState, useEffect } from "react";
import { UserTabContent } from "@/modules/users/components/UserTabContent";

// Types
type SystemUserRole = "super_admin" | "moderator";

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

interface UnassignedUser extends SystemUser {
  acceptedInvitationsCount: number;
}

// Utility functions
const getSystemRoleBadgeColor = (role: string): string => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "moderator":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

const getSystemRoleDisplayName = (role: SystemUserRole): string => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "moderator":
      return "Moderator";
    default:
      return "Unknown Role";
  }
};

const formatUserDisplayName = (
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

function UsersContent() {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [systemInvitations, setSystemInvitations] = useState<
    SystemInvitation[]
  >([]);
  const [unassignedUsers, setUnassignedUsers] = useState<UnassignedUser[]>([]);
  const [unassignedInvitations, setUnassignedInvitations] = useState<
    SystemInvitation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModerationOpen, setIsInviteModerationOpen] = useState(false);

  // API actions
  const getAllManagementUsers = useAction(
    api.superadmin.superusers.getAllManagementUsers
  );
  const getUsersWithAcceptedInvitationsNoOrgs = useAction(
    api.superadmin.superusers.getUsersWithAcceptedInvitationsNoOrgs
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load management users and invitations
      const managementResult = await getAllManagementUsers({
        includeInvitations: true,
      });

      if (managementResult.success) {
        setSystemUsers(managementResult.users);
        setSystemInvitations(managementResult.invitations || []);
      } else {
        setError(managementResult.error);
      }

      // Load unassigned users
      const unassignedResult = await getUsersWithAcceptedInvitationsNoOrgs({});
      if (unassignedResult.success) {
        setUnassignedUsers(unassignedResult.users);
        // Update unassigned invitations from this result instead of filtering systemInvitations
        setUnassignedInvitations(unassignedResult.invitations || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSuccess = () => {
    loadData();
  };

  // Filter users and invitations by role
  const superAdminUsers = systemUsers.filter(
    (user) => user.publicMetadata?.managementRole === "super_admin"
  );
  const moderationUsers = systemUsers.filter(
    (user) => user.publicMetadata?.managementRole === "moderator"
  );
  const superAdminInvitations = systemInvitations.filter(
    (inv) => inv.publicMetadata?.managementRole === "super_admin"
  );
  const moderationInvitations = systemInvitations.filter(
    (inv) => inv.publicMetadata?.managementRole === "moderator"
  );
  // const totalUnassigned = unassignedInvitations.length + unassignedUsers.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Error Loading Users
              </h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Management Users
          </h1>
          <p className="text-muted-foreground">
            Manage Super Admin and moderator users
          </p>
        </div>
        <Button
          onClick={() => setIsInviteModerationOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Invite Management Admin
        </Button>
      </div>

      <Tabs defaultValue="super_admin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="super_admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Super Admins ({superAdminUsers.length})
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Moderator ({moderationUsers.length})
          </TabsTrigger>
          {/* <TabsTrigger value="invited" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invited ({totalUnassigned})
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="super_admin">
          <UserTabContent
            type="super_admin"
            users={superAdminUsers}
            invitations={superAdminInvitations}
            formatUserDisplayName={formatUserDisplayName}
            getRoleBadgeColor={getSystemRoleBadgeColor}
            getSystemRoleDisplayName={getSystemRoleDisplayName}
          />
        </TabsContent>

        <TabsContent value="moderation">
          <UserTabContent
            type="moderator"
            users={moderationUsers}
            invitations={moderationInvitations}
            formatUserDisplayName={formatUserDisplayName}
            getRoleBadgeColor={getSystemRoleBadgeColor}
            getSystemRoleDisplayName={getSystemRoleDisplayName}
          />
        </TabsContent>

        {/* <TabsContent value="invited">
          <UnassignedUsersList
            unassignedUsers={unassignedUsers}
            unassignedInvitations={unassignedInvitations}
            formatUserDisplayName={formatUserDisplayName}
            onUserRoleAssigned={loadData}
          />
        </TabsContent> */}
      </Tabs>

      <InviteModerationDialog
        open={isInviteModerationOpen}
        onOpenChange={setIsInviteModerationOpen}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}

function Page() {
  return (
    <>
      <Authenticated>
        <UsersContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h2>
          <div className="text-sm text-muted-foreground">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default Page;
