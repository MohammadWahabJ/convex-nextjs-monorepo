import { Id } from "@workspace/backend/_generated/dataModel";

export interface MunicipalityDetailsViewProps {
  municipalityId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  imageUrl?: string;
  hasImage?: boolean;
}

export interface User {
  id: string;
  role: string;
  permissions: string[];
  createdAt: number; // Fixed: Changed from string to number to match API response
  updatedAt: number; // Fixed: Changed from string to number to match API response
  organization: {
    id: string;
    name: string;
    slug: string | null;
    imageUrl: string;
  } | null;
  user: {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    identifier: string;
    imageUrl: string | null;
  } | null;
}

export interface InvitedUser {
  id: string;
  emailAddress: string;
  role: string;
  organizationId: string;
  status: string | undefined; // Fixed: Made status optional to match API response
  url: string | null; // Fixed: Made url nullable to match API response
  createdAt: number; // Fixed: Changed from string to number to match API response
  updatedAt: number; // Fixed: Changed from string to number to match API response
  expiresAt: number | null; // Fixed: Made nullable to match API response
}

export interface Assistant {
  _id: Id<"assistants">;
  _creationTime: number;
  organizationId?: string;
  name: string;
  prompt: string;
  model: string;
  baseSystemPrompt?: string;
  type: "public" | "private" | "custom";
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
  isActive?: boolean;
  color?: string;
  vectorStoreId: string;
  description?: Record<string, any>;
  starterPrompt?: string[];
  settings?: {
    enableToolUse?: boolean;
    allowedTools?: string[];
    maxHistoryMessages?: number;
  };
}



// API Response Types
export interface OrganizationDetailsResponse {
  success: boolean;
  organization?: Organization;
  error?: string;
}

export interface UsersResponse {
  success: boolean;
  users?: User[];
  error?: string;
}

export interface InvitedUsersResponse {
  success: boolean;
  invitedUsers?: InvitedUser[];
  error?: string;
}

// Component Props
export interface MunicipalityHeaderProps {
  organizationDetails: Organization;
  onBack: () => void;
  onInviteUser: () => void;
  onManageAssistants: () => void;
}

export interface MunicipalityStatsProps {
  userCount: number;
  invitedUserCount: number;
  assistantCount: number;
  departmentCount: number;
}

export interface UsersTabProps {
  users: User[];
  getRoleBadgeColor: (role: string) => string;
}

export interface InvitedUsersTabProps {
  invitedUsers: InvitedUser[];
  getRoleBadgeColor: (role: string) => string;
  getStatusBadgeColor: (status: string) => string;
}

export interface AssistantsTabProps {
  assistants: Assistant[];
  onAssignAssistant: () => void;
}

export interface DepartmentsTabProps {
  departments: Assistant[];
  onAddDepartment: () => void;
}

export interface SettingsTabProps {
  organizationDetails: Organization;
  users: User[];
  invitedUsers: InvitedUser[];
  assistants: Assistant[];
}