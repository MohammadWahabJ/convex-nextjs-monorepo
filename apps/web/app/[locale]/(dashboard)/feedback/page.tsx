"use client";
import React, { useState } from "react";
import FeedbackModal from "@/modules/feedback/components/feedbackModal";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Replace with actual user/customer id from auth context or props
const CUSTOMER_ID = "demo-customer-id";

// Types based on the schema
type FeedbackType = "bug" | "feature" | "improvement" | "general";
type PriorityType = "low" | "medium" | "high";
type StatusType = "open" | "in-progress" | "resolved" | "closed";

interface Feedback {
  _id: string;
  _creationTime: number;
  customerId: string;
  feedbackType: FeedbackType;
  title: string;
  description: string;
  priority: PriorityType;
  status: StatusType;
  screenshots?: string[];
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: number;
  adminResponse?: string;
}

// --- Utility Components for improved UI ---

// A helper component to render the colored tag (Type, Priority, Status)
interface FeedbackTagProps {
  type: "type" | "priority" | "status";
  value: string;
}

const FeedbackTag: React.FC<FeedbackTagProps> = ({ type, value }) => {
  const formattedValue = value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  const getVariant = () => {
    switch (type) {
      case "type":
        if (value === "bug") return "destructive";
        if (value === "feature") return "default";
        if (value === "improvement") return "secondary";
        return "outline";
      case "priority":
        if (value === "high") return "destructive";
        if (value === "medium") return "secondary";
        return "outline";
      case "status":
        if (value === "resolved") return "default";
        if (value === "in-progress") return "secondary";
        if (value === "closed") return "outline";
        return "destructive";
      default:
        return "outline";
    }
  };

  const getIcon = (): React.ReactElement | null => {
    // Removed icons for now due to TypeScript config issues
    return null;
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {getIcon()}
      {formattedValue}
    </Badge>
  );
};

export default function FeedbackPage() {
  const t = useTranslations("feedback");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const feedbacks = useQuery(api.web.feedback.getUserFeedbackByID, {
    customerId: CUSTOMER_ID,
  }) as Feedback[] | undefined;

  const handleFeedbackSelect = (fb: Feedback) => {
    setSelectedFeedback(fb);
  };

  // Set the first item as selected by default once data loads
  React.useEffect(() => {
    if (feedbacks && feedbacks.length > 0 && selectedFeedback === null) {
      setSelectedFeedback(feedbacks[0]!);
    }
  }, [feedbacks, selectedFeedback]);

  // --- Render Functions ---

  const renderFeedbackList = () => {
    if (feedbacks === undefined) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground p-4">
            <div className="w-12 h-12 mx-auto mb-4 opacity-50 rounded-full bg-muted flex items-center justify-center">
              💬
            </div>
            <p>{t("loading_feedback")}</p>
          </div>
        </div>
      );
    }
    if (feedbacks.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground p-6">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50 rounded-full bg-muted flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("no_feedback_yet")}</h3>
            <p className="mb-4 text-sm">
              {t("share_thoughts")}
            </p>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <span className="text-lg">+</span>
              {t("submit_first_feedback")}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              onClick={() => handleFeedbackSelect(fb)}
              className={`p-3 rounded-md cursor-pointer transition-all hover:bg-muted/10 ${
                selectedFeedback?._id === fb._id ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {fb.title}
                </h3>
                <FeedbackTag type="type" value={fb.feedbackType} />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderFeedbackDetails = () => {
    if (!selectedFeedback) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50 rounded-full bg-muted flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("select_feedback_to_view")}
            </h3>
            <p className="text-sm">
              {t("choose_feedback_item")}
            </p>
          </div>
        </div>
      );
    }

    const fb = selectedFeedback;

    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <FeedbackTag type="type" value={fb.feedbackType} />
              <FeedbackTag type="priority" value={fb.priority} />
              <FeedbackTag type="status" value={fb.status} />
              <div className="text-sm text-muted-foreground ml-auto">
                {new Date(fb._creationTime).toLocaleDateString()}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {fb.title}
            </h1>
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{t("details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {fb.description}
              </p>
            </CardContent>
          </Card>

          {/* Screenshots */}
          {fb.screenshots && fb.screenshots.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">{t("screenshots")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fb.screenshots.map((url: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={url}
                        width={400}
                        height={300}
                        alt={`${t("screenshot")} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border shadow-sm transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Response */}
          {fb.adminResponse && (
            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-lg text-primary">
                  {t("admin_response")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {fb.adminResponse}
                </p>
                {fb.resolvedAt && (
                  <div className="text-sm text-muted-foreground mt-3">
                    {t("resolved_on")} {new Date(fb.resolvedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t("feedback_portal")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("portal_subtitle")}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2 shrink-0">
            <span className="text-lg">+</span>
            {t("submit")}
          </Button>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel: Feedback List */}
        <div className="w-full md:w-80 lg:w-96 border-r bg-card/30 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-foreground">{t("your_feedback")}</h2>
            <p className="text-sm text-muted-foreground">
              {feedbacks?.length || 0} {t("items")}
            </p>
          </div>
          <div className="flex-1 min-h-0">{renderFeedbackList()}</div>
        </div>

        {/* Right Panel: Feedback Details */}
        <div className="flex-1 bg-background hidden md:flex flex-col min-h-0">
          {renderFeedbackDetails()}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        open={modalOpen}
        setOpen={setModalOpen}
        customerId={CUSTOMER_ID}
      />
    </div>
  );
}
