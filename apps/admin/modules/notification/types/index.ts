export type NotificationType = "update" | "info" | "error" | "alert";

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  hasImage?: boolean;
  countryCode?: string;
  isActive?: boolean;
  helpDesk?: boolean;
  websiteLink?: string;
}

export interface NotificationAssignment {
  _id: string;
  _creationTime: number;
  organizationId: string;
  notificationId: string;
  role?: string;
  createdAt: number;
}

export interface Notification {
  _id: string;
  _creationTime: number;
  title: string;
  message: string;
  countryCode: string;
  type: NotificationType;
  actionUrl?: string;
  createdBy?: string;
  createdAt: number;
  organization_assignments?: NotificationAssignment[];
}

export interface NotificationFilters {
  searchTerm: string;
  typeFilter: string;
  organizationFilter: string;
}

export interface CreateNotificationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  organizations?: Organization[]; // Made optional since we'll handle country-based filtering
  onNotificationCreated?: () => void;
}

export interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationType;
  actionUrl: string;
  createdBy: string;
  selectedOrganizations: string[];
  assignToAll: boolean;
  accessRole: "org:admin" | "org:member";
  selectedCountryId?: string;
}