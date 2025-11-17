"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Building2, Plus } from "lucide-react";
import { AddMunicipalityModal } from "@/modules/municipality/modals/addMunicipalityModal";
import { DeleteMunicipalityModal } from "@/modules/municipality/modals/deleteMunicipalityModal";
import { InviteMunicipalityUserModal } from "@/modules/municipality/modals/InviteMunicipalityUserModal";

interface Organization {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  hasImage: boolean;
  countryCode?: string;
  isActive?: boolean;
  helpDesk?: boolean;
  websiteLink?: string;
}

interface OrganizationsResponse {
  success: boolean;
  organizations: Organization[];
  totalCount: number;
  error?: string;
}

export function MunicipalityView() {
  const router = useRouter();

  // Get organizations with role-based filtering using query
  const organizationsData = useQuery(
    api.superadmin.organization.getAllOrganizationsWithRole,
    { activeOnly: true }
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [organizationToInvite, setOrganizationToInvite] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <div className="container mx-auto py-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Municipalities</h1>
          <p className="text-muted-foreground">
            Manage municipality information and assistant assignments
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Municipality
        </Button>
      </div>

      {/* Organizations List */}
      <div className="space-y-6">
        {organizationsData && organizationsData.totalCount !== undefined && (
          <div className="mt-4 text-sm text-muted-foreground">
            Total organizations: {organizationsData.totalCount}
          </div>
        )}

        {organizationsData === undefined ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">
              Loading organizations...
            </span>
          </div>
        ) : organizationsData?.success &&
          organizationsData.organizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizationsData.organizations.map((org: Organization) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {org.hasImage ? (
                        <img
                          src={org.imageUrl}
                          alt={org.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate text-sm">
                        {org.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {org.slug}
                        {org.countryCode && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {org.countryCode}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          setOrganizationToInvite({
                            id: org.id,
                            name: org.name,
                          })
                        }
                      >
                        Invite User
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          setOrganizationToDelete({
                            id: org.id,
                            name: org.name,
                          })
                        }
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => router.push(`/municipalities/${org.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : organizationsData?.error ? (
          <Card className="border-destructive">
            <CardContent className="flex items-center space-x-3 py-4">
              <div className="w-4 h-4 bg-destructive rounded-full" />
              <div>
                <p className="font-medium text-destructive">
                  Error loading organizations
                </p>
                <p className="text-sm text-muted-foreground">
                  {organizationsData.error}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center space-x-3 py-4">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No organizations found
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddMunicipalityModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          // Query will automatically refresh
          setIsAddModalOpen(false);
        }}
      />

      <DeleteMunicipalityModal
        open={!!organizationToDelete}
        onOpenChange={(open) => !open && setOrganizationToDelete(null)}
        organization={organizationToDelete}
        onSuccess={() => {
          // Query will automatically refresh
          setOrganizationToDelete(null);
        }}
      />

      <InviteMunicipalityUserModal
        open={!!organizationToInvite}
        onOpenChange={(open) => !open && setOrganizationToInvite(null)}
        organizationId={organizationToInvite?.id ?? ""}
        organizationName={organizationToInvite?.name ?? ""}
        onSuccess={() => {
          // Query will automatically refresh
          setOrganizationToInvite(null);
        }}
      />
    </div>
  );
}
