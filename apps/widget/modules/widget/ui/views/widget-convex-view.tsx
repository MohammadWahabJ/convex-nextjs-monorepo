"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { WidgetMainView } from "./widget-main-view";
import type { FAQItem } from "../components";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useAtom } from "jotai";
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, loadingMessageAtom, organizationIdAtom } from "../../atoms/widget-atoms";

interface WidgetConvexViewProps {
  // Header Props
  logoUrl?: string;
  logoAlt?: string;
  title?: string;

  // Welcome Props
  welcomeTitle?: string;
  welcomeDescription?: string;
  aiNotice?: string;

  // Privacy Policy Props
  privacyPolicyText: string;
  organizationId: string;

  // Sidebar Footer Props
  sidebarFooterText?: {
    title: string;
    paragraph: string;
  };

  // FAQ Props
  faqs?: FAQItem[];
  faqTitle?: string;

  // Sidebar Props
  sidebarHeaderText?: string;

  // Event Handlers
  onEmailClick?: () => void;
  onMinimizeClick?: () => void;
  onCloseClick?: () => void;
  onPrivacyAccept?: (name?: string, contactSessionId?: string) => void;

  // Theme Props
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  buttonBackgroundColor?: string;
}

export const WidgetConvexView = (props: WidgetConvexViewProps) => {
  // Jotai atoms
  const [organizationId, setOrganizationId] = useAtom(organizationIdAtom);
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);
  const [loadingMessage, setLoadingMessage] = useAtom(loadingMessageAtom);

  
  // Contact session atom (organization-specific)
  const contactSessionIdAtom = contactSessionIdAtomFamily(props.organizationId);
  const [contactSessionId, setContactSessionId] = useAtom(contactSessionIdAtom);
  
  // Local loading state for message sending
  const [isLoading, setIsLoading] = useState(false);

  // Initialize organization ID when component mounts
  useEffect(() => {
    if (props.organizationId && organizationId !== props.organizationId) {
      setOrganizationId(props.organizationId);
    }
  }, [props.organizationId, organizationId, setOrganizationId]);

  // Convex hooks
  const createConversation = useMutation(api.public.conversations.create);
  const createMessage = useAction(api.public.messages.create);

  // Create conversation when user sends first message
  const handleCreateConversation = async () => {
    if (!contactSessionId || conversationId) return null;

    try {
      setLoadingMessage("Creating conversation...");
      const newConversationId = await createConversation({
        organizationId: props.organizationId,
        contactSessionId,
      });
      setConversationId(newConversationId);
      setLoadingMessage(null);
      return newConversationId;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setErrorMessage("Failed to create conversation. Please try again.");
      setLoadingMessage(null);
      return null;
    }
  };

  const handleMessageSend = async (message: { text: string }) => {
    if (!message.text || !contactSessionId) {
      console.warn("Cannot send message: missing text or contact session");
      setErrorMessage("Cannot send message: missing text or contact session");
      return;
    }
    console.log("inside handleMessageSend");
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous errors
    
    try {
      console.log("inside try");
      // Create conversation if it doesn't exist
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        console.log("Creating new conversation...");
        currentConversationId = await handleCreateConversation();
        if (!currentConversationId) {
          console.error("Failed to create conversation");
          setErrorMessage("Failed to create conversation. Please try again.");
          return;
        }
        console.log("Conversation created:", currentConversationId);
      }

      // Send the message
      console.log("Sending message:", message.text);
      setLoadingMessage("Sending message...");
      await createMessage({
        prompt: message.text,
        conversationId: currentConversationId,
        contactSessionId,
      });
      console.log("Message sent successfully");
      setLoadingMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to send message. Please try again.");
      setLoadingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = async (faq: FAQItem) => {
    await handleMessageSend({ text: faq.question });
  };

  const handlePrivacyAccept = (name?: string, sessionId?: string) => {
    if (sessionId) {
      setContactSessionId(sessionId as Id<"contactSessions">);
      console.log("Contact session created:", sessionId);
      setErrorMessage(null); // Clear any previous errors
    }
    props.onPrivacyAccept?.(name, sessionId);
  };

  return (
    <WidgetMainView
      {...props}
      // initialMessages={[]} // Start with empty messages - WidgetMainView will handle local state
      onMessageSend={handleMessageSend}
      onFAQClick={handleFAQClick}
      onPrivacyAccept={handlePrivacyAccept}
    />
  );
};
