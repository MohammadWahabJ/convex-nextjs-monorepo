import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Settings } from "lucide-react";
import { SettingsTabProps } from "../types/municipality.types";

export function SettingsTab({
  organizationDetails,
  users,
  invitedUsers,
  assistants,
}: SettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Organization Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4 text-white dark:text-white">
            Organization Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {organizationDetails.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">
                Slug
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {organizationDetails.slug || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">
                Organization ID
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono dark:text-white">
                {organizationDetails.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">
                Has Custom Image
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {organizationDetails.hasImage ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 text-white dark:text-white">
            Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {users.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {invitedUsers.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pending Invites
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {assistants.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Assistants
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
