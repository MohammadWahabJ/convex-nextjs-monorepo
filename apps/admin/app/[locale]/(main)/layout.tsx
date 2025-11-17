import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@workspace/ui/components/sidebar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          {/* Main content */}
          <main className="p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default Layout;
