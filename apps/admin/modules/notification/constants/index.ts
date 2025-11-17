import { NotificationType } from "../types";

export const NOTIFICATION_TYPES = [
  { value: "update" as const, label: "Update" },
  { value: "info" as const, label: "Info" },
  { value: "error" as const, label: "Error" },
  { value: "alert" as const, label: "Alert" },
] as const;

export const ACCESS_ROLES = [
  { value: "org:admin" as const, label: "Organization Admin" },
  { value: "org:member" as const, label: "Organization Member" },
] as const;

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, "default" | "destructive" | "outline" | "secondary"> = {
  error: "destructive",
  alert: "default",
  update: "secondary",
  info: "outline",
} as const;

export const FORM_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 500,
} as const;

export const UI_CONSTANTS = {
  NOTIFICATION_LIST_LIMIT: 50,
  ORGANIZATION_LIST_MAX_HEIGHT: 'max-h-48',
  SUCCESS_TIMEOUT: 1200,
  TRUNCATE_LENGTH: {
    TITLE: 25,
    ORGANIZATION_NAME: 30,
    CREATOR_NAME: 15,
    SEARCH_TERM: 20,
    FILTER_ORG_NAME: 25,
  },
} as const;