import { AssistantThreadView } from "@/modules/assistant/ui/views/assistant-thread-view";

const Page = async ({
  params,
}: {
  params: Promise<{
    threadId: string;
  }>
}) => {
  const { threadId } = await params;

  return <AssistantThreadView threadId={threadId} />
};
 
export default Page;
