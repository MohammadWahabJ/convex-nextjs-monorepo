"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, Building, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

interface AssignDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  user: {
    userId: string;
    firstName?: string;
    lastName?: string;
    identifier: string;
    imageUrl?: string;
  };
  onSuccess?: () => void;
}

export function AssignDepartmentModal({
  open,
  onOpenChange,
  organizationId,
  user,
  onSuccess,
}: AssignDepartmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all departments for the organization
  const departments = useQuery(api.web.department.getAllDepartments, {
    organizationId,
  }) as Doc<"assistants">[] | undefined;

  // Action to update user metadata
  const updateUserMetadata = useAction(api.web.user.updateUserMetadata);
  const getUserMetadata = useAction(api.web.user.getUserMetadata);

  // Get current user departments from Clerk
  useEffect(() => {
    if (open && user?.userId) {
      setError(null);
      setIsLoading(true);
      getUserMetadata({ userId: user.userId })
        .then((result) => {
          if (result.success && result.metadata?.department) {
            setSelectedDepartments(result.metadata.department);
          } else {
            setSelectedDepartments([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching user metadata:", err);
          setError("Failed to load user's current departments.");
          setSelectedDepartments([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!open) {
      setSelectedDepartments([]);
    }
  }, [open, user?.userId, getUserMetadata]);

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(departmentId)) {
        return prev.filter((id) => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await updateUserMetadata({
        userId: user.userId,
        department: selectedDepartments,
      });

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
        console.log(`Departments updated successfully for ${user.identifier}`);
      } else {
        setError(result.error || "Failed to update departments");
      }
    } catch (error) {
      console.error("Error updating user departments:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setSelectedDepartments([]);
        setError(null);
      }
    }
  };

  if (departments === undefined) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Assign Departments
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading departments...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Assign Departments
          </DialogTitle>
          <DialogDescription>
            Select departments to assign to{" "}
            <strong>
              {user.firstName} {user.lastName} ({user.identifier})
            </strong>
          </DialogDescription>
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.identifier}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Departments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-medium">Available Departments</h4>

            {!departments || departments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No departments available
              </p>
            ) : (
              <div className="space-y-2">
                {departments.map((department: Doc<"assistants">) => (
                  <div
                    key={department._id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      id={department._id}
                      checked={selectedDepartments.includes(department._id)}
                      onCheckedChange={() =>
                        handleDepartmentToggle(department._id)
                      }
                      disabled={isLoading}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={department._id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {department.name}
                      </label>
                      {department.prompt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {department.prompt.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Departments Summary */}
          {selectedDepartments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Departments</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDepartments.map((deptId) => {
                  const dept = departments?.find(
                    (d: Doc<"assistants">) => d._id === deptId
                  );
                  return dept ? (
                    <Badge key={deptId} variant="secondary" className="text-xs">
                      {dept.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Departments
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
