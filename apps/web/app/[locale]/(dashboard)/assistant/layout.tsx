import { AssistantLayout } from "@/modules/assistant/ui/layouts/assistant-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AssistantLayout>{children}</AssistantLayout>;
};

export default Layout;
