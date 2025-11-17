"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Building2, XCircle } from "lucide-react";

// Custom hooks
import { useMunicipalityData } from "../hooks/useMunicipalityData";

// Components
import { MunicipalityHeader } from "../components/MunicipalityHeader";
import { MunicipalityStats } from "../components/MunicipalityStats";
import { UsersTab } from "../components/UsersTab";
import { InvitedUsersTab } from "../components/InvitedUsersTab";
import { AssistantsTab } from "../components/AssistantsTab";
import { SettingsTab } from "../components/SettingsTab";

// Utils
import {
  getRoleBadgeColor,
  getStatusBadgeColor,
} from "../utils/municipality.utils";

// Types
import { MunicipalityDetailsViewProps } from "../types/municipality.types";

// Modals/Dialogs
import { InviteMunicipalityUserModal } from "@/modules/municipality/modals/InviteMunicipalityUserModal";
import { AssignAssistantDialog } from "@/components/assign-assistant-dialog";
import { DepartmentsTab } from "../components/DepartmentTab";

export function MunicipalityDetailsView({
  municipalityId,
}: MunicipalityDetailsViewProps) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignAssistantDialog, setShowAssignAssistantDialog] =
    useState(false);

  // Use custom hooks for data fetching
  const {
    organizationDetails,
    users,
    invitedUsers,
    loading,
    error,
    refetch: refetchMunicipalityData,
  } = useMunicipalityData(municipalityId);

  const assistants = useQuery(
    api.superadmin.assistant.getAssistantByOrganization,
    { municipalityId: municipalityId }
  );

  const allDepartments = useQuery(
    api.superadmin.assistant.getAssistantsByOrganizationAndType,
    {
      organizationId: municipalityId,
      type: "private",
    }
  );

  // Filter departments by organization ID
  const departments =
    allDepartments?.filter((dept) => dept.organizationId === municipalityId) ||
    [];

  // Event handlers
  const handleBack = () => router.back();
  const handleInviteUser = () => setShowInviteModal(true);
  const handleManageAssistants = () => setShowAssignAssistantDialog(true);
  const handleAssignAssistant = () => setShowAssignAssistantDialog(true);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-500">
            Loading municipality details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Details
          </h3>
          <p className="text-sm text-gray-500">{error}</p>
          <Button onClick={refetchMunicipalityData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!organizationDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">
            Municipality Not Found
          </h3>
          <p className="text-sm text-gray-500">
            The requested municipality could not be found.
          </p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      {/* Header */}
      <MunicipalityHeader
        organizationDetails={organizationDetails}
        onBack={handleBack}
        onInviteUser={handleInviteUser}
        onManageAssistants={handleManageAssistants}
      />

      {/* Quick Stats */}
      <MunicipalityStats
        userCount={users.length}
        invitedUserCount={invitedUsers.length}
        assistantCount={assistants?.length || 0}
        departmentCount={departments.length}
      />

      {/* Detailed Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invited">Pending Invitations</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersTab users={users} getRoleBadgeColor={getRoleBadgeColor} />
        </TabsContent>

        <TabsContent value="invited" className="space-y-4">
          <InvitedUsersTab
            invitedUsers={invitedUsers}
            getRoleBadgeColor={getRoleBadgeColor}
            getStatusBadgeColor={getStatusBadgeColor}
          />
        </TabsContent>

        <TabsContent value="assistants" className="space-y-4">
          <AssistantsTab
            assistants={assistants || []}
            onAssignAssistant={handleAssignAssistant}
          />
        </TabsContent>
        <TabsContent value="departments" className="space-y-4">
          <DepartmentsTab
            departments={departments}
            onAddDepartment={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Modals/Dialogs */}
      {showInviteModal && (
        <InviteMunicipalityUserModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          organizationId={municipalityId}
          organizationName={organizationDetails.name}
          onSuccess={() => {
            setShowInviteModal(false);
            refetchMunicipalityData();
          }}
        />
      )}

      {showAssignAssistantDialog && (
        <AssignAssistantDialog
          municipalityId={municipalityId as any}
          municipalityName={organizationDetails.name}
          open={showAssignAssistantDialog}
          onOpenChange={setShowAssignAssistantDialog}
          onSuccess={() => {
            // setShowAssignAssistantDialog(false);
            // refetchMunicipalityData();
          }}
        />
      )}
    </div>
  );
}
