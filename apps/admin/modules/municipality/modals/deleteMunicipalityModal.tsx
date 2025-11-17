"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { AlertTriangle } from "lucide-react";

interface DeleteMunicipalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: {
    id: string;
    name: string;
  } | null;
  onSuccess?: () => void;
}

export function DeleteMunicipalityModal({
  open,
  onOpenChange,
  organization,
  onSuccess,
}: DeleteMunicipalityModalProps) {
  const deleteOrganization = useAction(
    api.superadmin.organization.deleteOrganizationById
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationName, setConfirmationName] = useState("");

  const handleDelete = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);

    try {
      const result = await deleteOrganization({
        organizationId: organization.id,
      });

      if (result.success) {
        setConfirmationName("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.error || "Failed to delete municipality");
      }
    } catch (err) {
      console.error("Error deleting municipality:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setConfirmationName("");
    onOpenChange(false);
  };

  // Disable delete button unless name matches exactly
  const isNameMatching =
    organization && confirmationName.trim() === organization.name.trim();

  useEffect(() => {
    if (!open) {
      setConfirmationName("");
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Municipality
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This action <span className="font-semibold">cannot be undone</span>.
            To confirm, please type the name of the municipality below:
          </DialogDescription>
        </DialogHeader>

        {organization && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="confirm-name" className="text-sm">
              Type "<span className="font-semibold">{organization.name}</span>"
              to confirm
            </Label>
            <Input
              id="confirm-name"
              placeholder="Enter municipality name"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              disabled={loading}
              className={`
                ${isNameMatching ? "border-green-500" : ""}
                ${confirmationName && !isNameMatching ? "border-destructive" : ""}
                transition-all
              `}
            />
            {confirmationName && !isNameMatching && (
              <p className="text-destructive text-xs">
                Name does not match. Please type it exactly.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isNameMatching || loading}
          >
            {loading ? "Deleting..." : "Delete Municipality"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
