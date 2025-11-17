"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useUIMessages, useSmoothText } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputActionAddAttachments,
} from "@workspace/ui/components/ai/prompt-input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { FileUIPart } from "ai";

// Separate component for each message to handle streaming properly
const StreamingMessage = ({ message }: { message: UIMessage }) => {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  return (
    <AIMessage from={message.role === "system" ? "assistant" : message.role}>
      <AIMessageContent>
        {/* Handle file attachments from UIMessage parts */}
        {message.parts?.some(part => part.type === "file") && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.parts
              .filter(part => part.type === "file")
              .map((part, index) => (
                <div key={index} className="w-40">
                  <a
                    href={(part as any).url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate block"
                  >
                    {(part as any).filename || "File attachment"}
                  </a>
                </div>
              ))}
          </div>
        )}
        {message.role === "assistant" ? (
          <AIResponse>{visibleText}</AIResponse>
        ) : (
          visibleText
        )}
      </AIMessageContent>
    </AIMessage>
  );
};

export const AssistantThreadView = ({ threadId }: { threadId: string }) => {
  const router = useRouter();
  
  // Use the streaming hook instead of regular useQuery
  const { results: messages, status, loadMore } = useUIMessages(
    api.web.conversations.listThreadMessages,
    { threadId },
    { initialNumItems: 100, stream: true }
  );
  
  const thread = useQuery(api.web.conversations.getThread, { threadId });
  const assistants = useQuery(api.web.assistants.getAssistants);
  const createConversation = useAction(api.web.conversations.create);
  const generateUploadUrl = useMutation(
    api.web.conversations.generateUploadUrl
  );

  const [isLoading, setIsLoading] = useState(false);

  // Get the assistant ID from the first message's agent name or from thread metadata
  const assistantId = messages?.[0]?.agentName;
  const assistantName = assistants?.find((a) => a?.name === assistantId || a?._id === assistantId)?.name;

  const handleSubmit = async ({
    text,
    files,
  }: {
    text?: string;
    files?: FileUIPart[];
  }) => {
    if (isLoading || (!text && !files?.length)) return;

    // For streaming, we need to get the assistant ID from the existing messages or thread
    const currentAssistantId = assistantId || assistants?.[0]?._id;
    if (!currentAssistantId) {
      console.error("Could not determine assistant ID for this thread.");
      return;
    }

    setIsLoading(true);
    try {
      const attachments = files
        ? await Promise.all(
            files.map(async (file) => {
              const postUrl = await generateUploadUrl();
              // Fetch the source file and ensure it's OK before reading the blob
              const srcRes = await fetch(file.url);
              if (!srcRes.ok) {
                throw new Error(
                  `Failed to read file blob: ${srcRes.status} ${srcRes.statusText}`
                );
              }
              // Upload the blob to the storage service
              const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.mediaType },
                body: await srcRes.blob(),
              });
              // Check upload success and surface any error message
              if (!result.ok) {
                const msg = await result.text().catch(() => "");
                throw new Error(
                  `Upload failed: ${result.status} ${result.statusText} ${msg}`
                );
              }
              const { storageId } = await result.json();
              return {
                storageId,
                // Avoid non-null assertion; provide a fallback
                filename: file.filename ?? "attachment",
                mediaType: file.mediaType,
              };
            })
          )
        : undefined;
      await createConversation({
        prompt: text ?? "",
        threadId,
        assistantId: currentAssistantId as Id<"assistants">,
        attachments,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b flex items-center gap-4 shrink-0">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold truncate">
            {thread?.title ?? "Conversation"}
          </h1>
          {assistantName && (
            <p className="text-xs text-muted-foreground">{assistantName}</p>
          )}
        </div>
      </header>
      <AIConversation>
        <AIConversationContent>
          {status === "LoadingFirstPage" && (
            <div className="p-4">Loading messages...</div>
          )}
          {messages?.map((msg) => (
            <StreamingMessage key={msg.key} message={msg} />
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-4 border-t shrink-0">
        <PromptInput
          onSubmit={handleSubmit}
          accept="image/*,application/pdf"
          multiple
        >
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea
            placeholder="Ask me anything..."
            disabled={isLoading}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit
              status={isLoading ? "submitted" : "ready"}
              disabled={isLoading}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
