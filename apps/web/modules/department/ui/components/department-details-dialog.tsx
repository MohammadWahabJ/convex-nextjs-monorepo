"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Id } from "@workspace/backend/_generated/dataModel";

interface DepartmentDetailsDialogProps {
  departmentId: Id<"assistants"> | null;
  onClose: () => void;
}

export function DepartmentDetailsDialog({
  departmentId,
  onClose,
}: DepartmentDetailsDialogProps) {
  const department = useQuery(
    api.web.department.getDepartmentById,
    departmentId ? { id: departmentId } : "skip"
  );

  return (
    <Dialog open={!!departmentId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {department ? department.name : "Department Details"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Details of the selected department."
              : "Loading department details..."}
          </DialogDescription>
        </DialogHeader>
        {department ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Name
              </p>
              <p className="col-span-3 text-sm text-muted-foreground">
                {department.name}
              </p>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description
              </p>
              <p className="col-span-3 text-sm text-muted-foreground">
                {department.prompt || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                AI Model
              </p>
              <p className="col-span-3 text-sm text-muted-foreground">
                {department.model || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Starter Prompts
              </p>
              <div className="col-span-3">
                {department.starterPrompt &&
                department.starterPrompt.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {department.starterPrompt.map((prompt, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {prompt}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Created At
              </p>
              <p className="col-span-3 text-sm text-muted-foreground">
                {new Date(department._creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
