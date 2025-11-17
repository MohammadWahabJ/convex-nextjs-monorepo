"use client";

import React from "react";
import {
  WidgetHeader,
  WidgetChatArea,
  WidgetInputArea,
  WidgetSideBar,
  PrivacyPolicyDialog,
} from "../components";
import type { FAQItem } from "../components";
import { useAtomValue } from "jotai";
import { historyPageAtom } from "../../atoms/widget-atoms";
import WidgetHistory from "../components/widget-history";

interface WidgetMainViewProps {
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
  onFAQClick?: (faq: FAQItem) => void;
  onMessageSend?: (message: { text: string }) => void;
  onPrivacyAccept?: (name?: string, contactSessionId?: string) => void;

  // Theme Props
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  buttonBackgroundColor?: string;
}

export const WidgetMainView = ({
  logoUrl,
  logoAlt,
  title,
  welcomeTitle,
  welcomeDescription,
  aiNotice,
  privacyPolicyText,
  organizationId,
  faqs = [],
  faqTitle,
  sidebarFooterText,
  onEmailClick,
  onMinimizeClick,
  onCloseClick,
  onFAQClick,
  onMessageSend,
  onPrivacyAccept,
  backgroundColor,
  textColor,
  mutedTextColor,
  borderColor,
  buttonBackgroundColor,
}: WidgetMainViewProps) => {
  const isHistoryPage = useAtomValue(historyPageAtom);

  const handleMessageSubmit = (message: { text: string }) => {
    // Call parent handler if provided
    if (onMessageSend) {
      onMessageSend(message);
    }
  };

  const handleFAQClick = (faq: FAQItem) => {
    // Call parent handler if provided
    if (onFAQClick) {
      onFAQClick(faq);
    }
  };

  return (
    <>
      {/* Privacy Policy Dialog */}
      <PrivacyPolicyDialog
        privacyPolicyText={privacyPolicyText}
        organizationId={organizationId}
        onAccept={onPrivacyAccept}
      />

      <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor }}>
        {/* Sidebar - visible on md screens and above */}
        <WidgetSideBar
          logoUrl={logoUrl}
          logoAlt={logoAlt}
          headerText={sidebarFooterText?.title}
          footerText={sidebarFooterText?.paragraph}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
        />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <WidgetHeader
          logoUrl={logoUrl}
          logoAlt={logoAlt}
          title={title}
          onEmailClick={onEmailClick}
          onMinimizeClick={onMinimizeClick}
          onCloseClick={onCloseClick}
          backgroundColor={backgroundColor}
          textColor={textColor}
          borderColor={borderColor}
        />

        {/* Main content with flexible height */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor }}>
          {isHistoryPage ? (
            <WidgetHistory 
              backgroundColor={backgroundColor}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
              borderColor={borderColor}
            />
          ) : (
            <WidgetChatArea 
              textColor={textColor}
              backgroundColor={backgroundColor}
              welcomeTitle={welcomeTitle}
              welcomeDescription={welcomeDescription}
              aiNotice={aiNotice}
              faqTitle={faqTitle}
              faqs={faqs}
              onFAQClick={handleFAQClick}
              mutedTextColor={mutedTextColor}
              borderColor={borderColor}
              buttonBackgroundColor={buttonBackgroundColor}
            />
          )}
        </div>

        {!isHistoryPage && (
          <WidgetInputArea
            onSubmit={handleMessageSubmit}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            textColor={textColor}
          />
        )}
      </div>
    </div>
    </>
  );
};
