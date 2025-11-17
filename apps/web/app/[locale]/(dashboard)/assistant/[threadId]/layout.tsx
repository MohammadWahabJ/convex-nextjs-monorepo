import { AssistantThreadLayout } from "@/modules/assistant/ui/layouts/assistant-thread-layout";

const Layout = ({ children }: { children: React.ReactNode; }) => {
  return <AssistantThreadLayout>{children}</AssistantThreadLayout>;
};
 
export default Layout;
