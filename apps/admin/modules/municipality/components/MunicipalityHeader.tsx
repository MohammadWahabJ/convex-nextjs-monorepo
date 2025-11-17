import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Building2, UserPlus, Bot } from "lucide-react";
import { MunicipalityHeaderProps } from "../types/municipality.types";

export function MunicipalityHeader({
  organizationDetails,
  onBack,
  onInviteUser,
  onManageAssistants,
}: MunicipalityHeaderProps) {
  return (
    <div className="flex items-center justify-between text-foreground">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {organizationDetails.imageUrl ? (
              <img
                src={organizationDetails.imageUrl}
                alt={organizationDetails.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {organizationDetails.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Organization ID: {organizationDetails.id}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={onInviteUser}
          className="flex items-center space-x-2"
          variant="default"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite User</span>
        </Button>
        <Button
          onClick={onManageAssistants}
          className="flex items-center space-x-2"
          variant="default"
        >
          <Bot className="h-4 w-4" />
          <span>Manage Assistants</span>
        </Button>
      </div>
    </div>
  );
}
