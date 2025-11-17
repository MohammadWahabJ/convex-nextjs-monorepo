import { AdminAuthLayout } from "@/modules/auth/ui/layouts/auth-layout";


const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AdminAuthLayout>
            {children}
        </AdminAuthLayout>
    )
}

export default Layout;