"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Users, Mail, Crown, User, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { AssignDepartmentModal } from "./assignDepartmentModal";


interface UsersListProps {
  organizationId: string;
}

export function UsersList({ organizationId }: UsersListProps) {
  const getUsersByOrganization = useAction(api.web.user.getUsersByOrganization);
  const [organizationUsers, setOrganizationUsers] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Load users when organization is available
  useEffect(() => {
    if (organizationId && !organizationUsers && !loadingUsers) {
      setLoadingUsers(true);
      getUsersByOrganization({ organizationId })
        .then((result) => {
          setOrganizationUsers(result);
        })
        .catch((error) => {
          console.error("Error fetching organization users:", error);
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [organizationId, getUsersByOrganization, organizationUsers, loadingUsers]);

  const handleAssignDepartments = (user: any) => {
    setSelectedUser({
      userId: user.user?.userId,
      firstName: user.user?.firstName,
      lastName: user.user?.lastName,
      identifier: user.user?.identifier,
      imageUrl: user.user?.imageUrl,
    });
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    // Optionally refresh the users list or show a success message
    console.log("Departments assigned successfully");
    setSelectedUser(null);
  };

  if (loadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (organizationUsers?.success === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Failed to load users</p>
            <p className="text-sm text-red-500">{organizationUsers.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    !organizationUsers?.success ||
    !organizationUsers?.users ||
    organizationUsers.users.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            All Users
            <span className="text-sm font-normal text-muted-foreground">
              (0)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No users found in this organization
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          All Users
          <span className="text-sm font-normal text-muted-foreground">
            ({organizationUsers.total})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {organizationUsers.users.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.user?.imageUrl}
                    alt={`${member.user?.firstName} ${member.user?.lastName}`}
                  />
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">
                      {member.user?.firstName} {member.user?.lastName}
                    </h4>
                    {member.role === "org:admin" && (
                      <Crown size={14} className="text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={12} />
                    {member.user?.identifier}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAssignDepartments(member)}
                  className="text-xs h-7"
                >
                  <Settings size={12} className="mr-1" />
                  Assign
                </Button>
                <Badge
                  variant={
                    member.role === "org:admin" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {member.role === "org:admin"
                    ? "Admin"
                    : member.role === "org:member"
                      ? "Member"
                      : member.role}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Assign Department Modal */}
      {selectedUser && (
        <AssignDepartmentModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          organizationId={organizationId}
          user={selectedUser}
          onSuccess={handleAssignSuccess}
        />
      )}
    </Card>
  );
}
