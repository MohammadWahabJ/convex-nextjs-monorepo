import { AlertCircle, Info, AlertTriangle, RefreshCw, Bell } from "lucide-react";
import { NotificationType } from "../types";
import { NOTIFICATION_TYPE_COLORS } from "../constants";

export const getTypeColor = (type: NotificationType): "default" | "destructive" | "outline" | "secondary" => {
  return NOTIFICATION_TYPE_COLORS[type] as "default" | "destructive" | "outline" | "secondary" || "secondary";
};

export const getTypeIcon = (type: NotificationType) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (type) {
    case "error":
      return AlertCircle;
    case "alert":
      return AlertTriangle;
    case "update":
      return RefreshCw;
    case "info":
      return Info;
    default:
      return Bell;
  }
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getOrganizationDisplayName = (
  organizations: Array<{ id: string; name: string }>,
  organizationId: string,
  maxLength?: number
): string => {
  const org = organizations.find((o) => o.id === organizationId);
  const name = org?.name || organizationId;
  
  if (maxLength && name.length > maxLength) {
    return truncateText(name, maxLength);
  }
  
  return name;
};