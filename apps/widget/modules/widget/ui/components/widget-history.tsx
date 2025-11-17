"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
} from "../../atoms/widget-atoms";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 60) {
    return `about ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
  } else if (diffInHours < 24) {
    return `about ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

interface WidgetHistoryProps {
  onChatSelect?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
}

const WidgetHistory: React.FC<WidgetHistoryProps> = ({
  onChatSelect,
  onChatDelete,
  backgroundColor,
  textColor,
  mutedTextColor,
  borderColor,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    }
  );

  const filteredConversations = (conversations.results ?? []).filter(
    (conversation) =>
      (conversation.lastMessage?.text ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleContinue = (chatId: string) => {
    onChatSelect?.(chatId);
  };

  return (
    <div className="flex h-full w-full flex-col" style={{ backgroundColor }}>
      <Card
        className="flex h-full flex-col border-0 shadow-none"
        style={{ backgroundColor }}
      >
        <CardHeader className="border-b pb-4" style={{ borderColor }}>
          <CardTitle className="text-2xl" style={{ color: textColor }}>
            Chat History
          </CardTitle>
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: mutedTextColor }}
            />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              style={{ backgroundColor, color: textColor, borderColor }}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare
                    className="mb-4 size-12"
                    style={{ color: mutedTextColor, opacity: 0.5 }}
                  />
                  <p className="text-sm" style={{ color: mutedTextColor }}>
                    {searchQuery
                      ? "No conversations found"
                      : "No chat history yet"}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: mutedTextColor, opacity: 0.7 }}
                  >
                    {searchQuery
                      ? "Try a different search term"
                      : "Start a conversation to see it here"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all hover:shadow-sm",
                      hoveredId === conversation._id && "bg-accent/30"
                    )}
                    style={{
                      backgroundColor:
                        hoveredId === conversation._id
                          ? "rgba(255, 255, 255, 0.1)"
                          : backgroundColor,
                      borderColor,
                    }}
                    onClick={() => {
                      setConversationId(conversation._id);
                      handleContinue(conversation._id);
                    }}
                    onMouseEnter={() => setHoveredId(conversation._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Chat Icon */}
                    <div className="mt-1 shrink-0">
                      <div
                        className="flex size-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      >
                        <MessageSquare
                          className="size-4"
                          style={{ color: textColor }}
                        />
                      </div>
                    </div>

                    {/* Chat Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p
                          className="line-clamp-2 text-sm font-medium leading-tight"
                          style={{ color: textColor }}
                        >
                          {conversation.lastMessage?.text || "No messages yet"}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: mutedTextColor }}>
                        {formatTimeAgo(new Date(conversation._creationTime))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WidgetHistory;