import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@workspace/ui/components/ai/ai-message";
import { Response } from "@workspace/ui/components/ai/ai-response";
import {
  AISuggestions,
  AISuggestion,
} from "@workspace/ui/components/ai/suggestion";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useThreadMessages } from "@convex-dev/agent/react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useAtomValue } from "jotai";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
} from "../../atoms/widget-atoms";
import { WidgetWelcome, WidgetFAQButtons } from "./index";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface WidgetChatAreaProps {
  className?: string;
  textColor?: string;
  backgroundColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  buttonBackgroundColor?: string;

  // Welcome Props
  welcomeTitle?: string;
  welcomeDescription?: string;
  aiNotice?: string;

  // FAQ Props
  faqs?: Array<{ id: string; question: string; answer?: string }>;
  faqTitle?: string;
  onFAQClick?: (faq: { id: string; question: string; answer?: string }) => void;

  // Suggestions Props
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const WidgetChatArea = ({
  className,
  textColor,
  backgroundColor,
  mutedTextColor,
  borderColor,
  buttonBackgroundColor,
  welcomeTitle,
  welcomeDescription,
  aiNotice,
  faqs = [],
  faqTitle,
  onFAQClick,
  suggestions = [],
  onSuggestionClick,
}: WidgetChatAreaProps) => {
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany as any,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 }
  );

  const uiMessages = messages.results;

  console.log(uiMessages, "uiMessagesuiMessages");

  return (
    <AIConversation
      className={cn("flex-1 h-full", className)}
      style={{ backgroundColor }}
    >
      <AIConversationContent className="px-6 py-4">
        {uiMessages.length === 0 ? (
          <div className="flex flex-col h-full">
            <WidgetWelcome
              title={welcomeTitle}
              description={welcomeDescription}
              aiNotice={aiNotice}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
            />
            <WidgetFAQButtons
              title={faqTitle}
              faqs={faqs}
              onFAQClick={onFAQClick}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
              borderColor={borderColor}
              buttonBackgroundColor={buttonBackgroundColor}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {uiMessages.map((message) => {
              const messageData = message as any;
              const role = messageData.message?.role || "user";

              // Extract content based on the message structure
              let content = "";
              if (messageData.message?.content) {
                if (Array.isArray(messageData.message.content)) {
                  // Handle array of content objects (AI responses)
                  content = messageData.message.content
                    .map((item: any) => item.text || item.content || "")
                    .join("");
                } else {
                  // Handle simple string content
                  content = messageData.message.content;
                }
              } else if (messageData.text) {
                // Fallback to text property
                content = messageData.text;
              }

              return (
                <Message key={message.key} from={role}>
                  <MessageContent variant="contained">
                    <Response>{content}</Response>
                  </MessageContent>
                </Message>
              );
            })}
          </div>
        )}
        {uiMessages.length === 1 && suggestions.length > 0 && (
          <AISuggestions className="flex w-full flex-col items-end p-2">
            {suggestions.map((suggestion) => {
              if (!suggestion) {
                return null;
              }

              return (
                <AISuggestion
                  key={suggestion}
                  onClick={() => {
                    onSuggestionClick?.(suggestion);
                  }}
                  suggestion={suggestion}
                />
              );
            })}
          </AISuggestions>
        )}
      </AIConversationContent>
      <AIConversationScrollButton />
    </AIConversation>
  );
};
