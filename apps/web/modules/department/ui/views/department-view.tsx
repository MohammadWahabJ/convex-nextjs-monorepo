"use client";

import { Plus, Building, Users, Bot } from "lucide-react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";

import { InviteMunicipalityUserModal } from "@/modules/department/ui/components/invite-municipality-user-modal";
import { DepartmentsList } from "@/modules/department/ui/components/departments-list";
import { UsersList } from "@/modules/department/ui/components/users-list";

import { useOrganization } from "@clerk/nextjs";
import CreateDepartmentModal from "../components/create-department-modal";
import { useTranslations } from "next-intl";

export function DepartmentView() {
  const t = useTranslations("department");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Get organization data from Clerk
  const { organization } = useOrganization();

  if (!organization) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading_organization")}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2"
            >
              {t("invite_user")}
            </Button>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {t("create_department")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-x-2">
            <TabsTrigger
              value="departments"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Building size={16} />
              {t("departments")}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Users size={16} />
              {t("users")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="mt-6">
            <DepartmentsList organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersList organizationId={organization.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Department Modal */}
      <CreateDepartmentModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        organizationId={organization.id}
      />

      {/* Invite User Modal */}
      <InviteMunicipalityUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        organizationId={organization.id}
        organizationName={organization.name}
      />
    </div>
  );
}
