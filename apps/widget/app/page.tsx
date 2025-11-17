"use client";

import { WidgetConvexView } from "@/modules/widget/ui/views/widget-convex-view";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Loader2Icon } from "lucide-react";

// Sample FAQ data - Replace this with data from your backend
const sampleFAQs = [
  {
    id: "1",
    question: "What should I do with my green waste?",
  },
  {
    id: "2",
    question: "When are the mayor's office hours?",
  },
  {
    id: "3",
    question: "Where do I take the garbage?",
  },
  {
    id: "4",
    question: "What are the opening hours of the business office?",
  },
];

const WidgetPage = () => {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");

  const widgetSettings = useQuery(
    api.widget.settings.getWidgetSettings,
    organizationId ? { organizationId } : "skip"
  );

  if (widgetSettings === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (widgetSettings === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Widget not configured for this organization.</p>
      </div>
    );
  }

  return (
    <WidgetConvexView
      logoUrl={widgetSettings.logoUrl || "https://cdn.logojoy.com/wp-content/uploads/20230801145656/Google_2011_logo-600x206.png"}
      title={widgetSettings.title || "Helpdesk"}
      welcomeTitle={widgetSettings.welcomeTitle || "Welcome"}
      organizationId={organizationId!} // It's safe to assert here because of the checks above
      welcomeDescription={widgetSettings.welcomeDescription || "I am your digital assistant and am available to you around the clock for questions and concerns. Simply write your request in the input field below. I look forward to helping you!"}
      aiNotice={widgetSettings.aiNotice || "This AI-generated information is for initial orientation; for binding information, please contact experts."}
      privacyPolicyText={widgetSettings.privacyPolicyText || "By using this widget, you agree to our privacy policy and terms of service. We collect and process your data in accordance with GDPR regulations. Your information will be used solely for providing customer support and improving our services. We do not share your personal information with third parties without your consent. You have the right to access, modify, or delete your data at any time. For more information, please contact our support team."}
      faqs={widgetSettings.faqs || []}
      sidebarFooterText={{
        title: "Powered by KI Quadrat",
        paragraph: "Ask in the language of your choice.",
      }}
      faqTitle={widgetSettings.faqTitle || "FREQUENTLY ASKED QUESTIONS"}
      onEmailClick={() => console.log("Email clicked")}
      onMinimizeClick={() => console.log("Minimize clicked")}
      onCloseClick={() => console.log("Close clicked")}
      onPrivacyAccept={(name) =>
        console.log("Privacy accepted by:", name || "Anonymous")
      }
      backgroundColor={widgetSettings.backgroundColor || "#03051a"}
      textColor={widgetSettings.textColor || "#ffffff"}
      mutedTextColor={widgetSettings.mutedTextColor || "#cbd5e1"}
      borderColor={widgetSettings.borderColor || "#334155"}
      buttonBackgroundColor={widgetSettings.buttonBackgroundColor || "#03051a"}
    />
  );
};

export default WidgetPage;
