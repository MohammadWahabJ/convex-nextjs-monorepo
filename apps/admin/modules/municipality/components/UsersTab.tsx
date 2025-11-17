import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Users } from "lucide-react";
import { UsersTabProps } from "../types/municipality.types";
import {
  formatDate,
  getUserDisplayName,
  getUserInitials,
} from "../utils/municipality.utils";

export function UsersTab({ users, getRoleBadgeColor }: UsersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Organization Members ({users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-sm text-gray-500">
              Invite users to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.user?.imageUrl || ""} />
                    <AvatarFallback>
                      {user.user ? getUserInitials(user.user) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.user
                        ? getUserDisplayName(user.user)
                        : "Unknown User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.user?.identifier}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    Joined {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
