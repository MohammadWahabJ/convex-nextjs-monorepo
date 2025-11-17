"use client";

import { useUser } from "@clerk/nextjs";
import { ReactNode } from "react";

interface SuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SuperAdminGuard component that only renders children if the user has super_admin role.
 * For moderators or other roles, it will either render nothing or an optional fallback.
 * 
 * @param children - The content to render if user is super_admin
 * @param fallback - Optional content to render if user is not super_admin
 */
export function SuperAdminGuard({ children, fallback = null }: SuperAdminGuardProps) {
  const { user } = useUser();
  
  const managementRole = user?.publicMetadata?.managementRole as string | undefined;
  
  // Only render children if the user is a super_admin
  if (managementRole === "super_admin") {
    return <>{children}</>;
  }
  
  // Return fallback (or null) for moderators and other roles
  return <>{fallback}</>;
}
