"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Building, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { DepartmentDetailsDialog } from "./department-details-dialog";
import { UpdateDepartmentModal } from "./update-department-modal";
import { Id } from "@workspace/backend/_generated/dataModel";


interface DepartmentsListProps {
  organizationId: string;
}

export function DepartmentsList({ organizationId }: DepartmentsListProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<Id<"assistants"> | null>(null);
  const [departmentToUpdateId, setDepartmentToUpdateId] = useState<Id<"assistants"> | null>(null);

  // Fetch all departments for the organization
  const departments = useQuery(api.web.department.getAllDepartments, {
    organizationId,
  });

  if (departments === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            All Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            All Departments
            <span className="text-sm font-normal text-muted-foreground">
              (0)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No departments found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building size={20} />
          All Departments
          <span className="text-sm font-normal text-muted-foreground">
            ({departments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.map((department) => {
            return (
              <div
                key={department._id}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedDepartmentId(department._id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium">{department.name}</h4>
                    </div>
                 
                    <div className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(department._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                  <Pencil
                    className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer ml-4"
                    onClick={() => setDepartmentToUpdateId(department._id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <DepartmentDetailsDialog
        departmentId={selectedDepartmentId}
        onClose={() => setSelectedDepartmentId(null)}
      />
      <UpdateDepartmentModal
        open={!!departmentToUpdateId}
        onOpenChange={(open) => {
          if (!open) {
            setDepartmentToUpdateId(null);
          }
        }}
        departmentId={departmentToUpdateId}
      />
    </Card>
  );
}
