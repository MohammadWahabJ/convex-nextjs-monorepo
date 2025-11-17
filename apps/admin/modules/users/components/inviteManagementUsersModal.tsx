"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Loader2,
  UserPlus,
  Mail,
  Shield,
  UserCheck,
  Globe,
} from "lucide-react";

interface InviteModerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ManagementRole = "super_admin" | "moderator";
type CountryCode = "RO" | "TU" | "UAE";

export function InviteModerationDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteModerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<ManagementRole | "">("");
  const [countryCode, setCountryCode] = useState<CountryCode | "">("");
  const [error, setError] = useState<string | null>(null);

  const inviteManagementUser = useAction(
    api.superadmin.superusers.inviteManagementUser
  );

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    // Validate email
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate role
    if (!selectedRole) {
      setError("Please select a management role");
      return;
    }

    // Validate country code for moderator role
    if (selectedRole === "moderator" && !countryCode) {
      setError("Please select a country code for moderator role");
      return;
    }

    setIsLoading(true);
    try {
      // Use the correct admin app URL with proper redirect to root page
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/sign-up?redirect_url=${encodeURIComponent(`${baseUrl}/`)}`;

      const result = await inviteManagementUser({
        emailAddress: email.trim(),
        managementRole: selectedRole as ManagementRole,
        countryCode: selectedRole === "moderator" ? countryCode : undefined,
        redirectUrl: redirectUrl,
      });

      if (result.success) {
        // Reset form
        setEmail("");
        setSelectedRole("");
        setCountryCode("");
        setError(null);
        onOpenChange(false);
        onSuccess?.();

        // Show success message
        console.log(
          `Invitation sent successfully to ${email} with role ${selectedRole}`
        );
      } else {
        setError(result.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
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
        setEmail("");
        setSelectedRole("");
        setCountryCode("");
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite Management User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join the admin panel with a specific
            management role and country assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Management Role *
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                setSelectedRole(value as ManagementRole);
                // Reset country code when role changes
                if (value === "super_admin") {
                  setCountryCode("");
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a management role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span>Super Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="moderator">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span>Moderator</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "moderator" && (
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country Code *
              </Label>
              <Select
                value={countryCode}
                onValueChange={(value) => setCountryCode(value as CountryCode)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RO">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span>Romania (RO)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TU">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-red-600" />
                      <span>Turkey (TU)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="UAE">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span>United Arab Emirates (UAE)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the country for moderation scope
              </p>
            </div>
          )}

          {selectedRole && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">Role Preview:</h4>
              <pre className="text-xs text-muted-foreground">
                {JSON.stringify(
                  {
                    managementRole: selectedRole,
                    ...(selectedRole === "moderator" &&
                      countryCode && { countryCode }),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium text-center">
                {error}
              </p>
            </div>
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
            <Button
              type="submit"
              disabled={
                isLoading ||
                !email.trim() ||
                !selectedRole ||
                (selectedRole === "moderator" && !countryCode)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
