"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
  Building2,
  Bot,
  Home,
  Settings,
  Wrench,
  Users,
  Bell,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/modules/auth/ui/components/theme-toggle";

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Management Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Municipalities",
    url: "/municipalities",
    icon: Building2,
  },
  {
    title: "Assistants",
    url: "/assistants",
    icon: Bot,
  },
  {
    title: "Tools",
    url: "/tools",
    icon: Wrench,
  },

  {
    title: "Knowledgebase",
    url: "/knowledgebase",
    icon: Wrench,
  },
  {
    title: "Portal Feedbacks",
    url: "/feedbacks",
    icon: Settings,
  },
  {
    title: "Notifications",
    url: "/notification",
    icon: Bell,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useUser();

  const isActive = (url: string) => {
    const pathWithoutLocale = `/${pathname.split("/").slice(2).join("/")}`;

    if (url === "/") {
      return pathWithoutLocale === "/";
    }

    return pathWithoutLocale.startsWith(url);
  };

  const managementRole = user?.user?.publicMetadata?.managementRole as string | undefined;
  
  // Filter navigation items based on role
  const filteredNavItems = adminNavItems.filter((item) => {
    // If super_admin, show all items
    if (managementRole === "super_admin") {
      return true;
    }
    
    // If moderator, hide users and tools pages
    if (managementRole === "moderator") {
      return item.url !== "/users" && item.url !== "/tools";
    }
    
    // Default: show all (fallback)
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-sidebar-foreground">
              Admin Panel
            </span>
            <span className="truncate text-xs text-sidebar-muted-foreground">
              Management Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "w-full! h-8!",
                  userButtonTrigger:
                    "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                  userButtonBox:
                    "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
                  userButtonOuterIdentifier:
                    "pl-0! group-data-[collapsible=icon]:hidden!",
                  avatarBox: "size-4!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
