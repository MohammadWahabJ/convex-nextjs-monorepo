"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { BotIcon, X, Send } from "lucide-react";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@workspace/ui/components/ai/prompt-input";
import {
  AISuggestion,
  AISuggestions,
} from "@workspace/ui/components/ai/suggestion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

// Constants
const DEFAULT_COLOR = "#3B82F6"; // Blue 500

// Message type for the chat
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Assistant prop types
interface Assistant {
  _id: Id<"assistants">;
  name: string;
  description?: Record<string, any>;
  model: string;
  color?: string;
  prompt: string;
  starterPrompt?: string[];
}

interface AssistantTestModalProps {
  assistant: Assistant;
  isOpen: boolean;
  onClose: () => void;
}

// Default starter prompts for a clean fallback
const DEFAULT_STARTER_PROMPTS = [
  "Hello, can you introduce yourself?",
  "What tasks are you designed to handle?",
  "Give me an example of your best use case.",
];

export function AssistantTestModal({
  assistant,
  isOpen,
  onClose,
}: AssistantTestModalProps): React.JSX.Element | null {
  // State management for the ephemeral chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex action for ephemeral chat
  const ephemeralChat = useAction(api.superadmin.conversations.ephemeralChat);

  const assistantColor = assistant.color || DEFAULT_COLOR;
  const starterPrompts = assistant.starterPrompt?.length
    ? assistant.starterPrompt
    : DEFAULT_STARTER_PROMPTS;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Handle message submission
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const value = message.text || "";
      if (!value.trim()) return;

      setIsLoading(true);

      // Add user message to local state immediately
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: value.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Don't set streamingContent immediately - let loading indicator show first

        const response = await ephemeralChat({
          prompt: value.trim(),
          baseSystemPrompt: assistant.prompt,
          model: assistant.model,
        });

        // Add final assistant message to local state
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error during ephemeral chat:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setStreamingContent(null); // End of streaming
        setIsLoading(false);
      }
    },
    [assistant, ephemeralChat]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSubmit({ text: suggestion });
    },
    [handleSubmit]
  );

  // Clear local message state for a new chat
  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setStreamingContent(null);
  }, []);

  // Reset state when modal is closed or assistant changes
  useEffect(() => {
    if (!isOpen) {
      handleClearMessages();
    }
  }, [isOpen, handleClearMessages]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[80%] min-w-[80vw] max-w-[95vw] h-[80vh] mx-4 bg-background border rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-card/50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`/api/avatar/${assistant._id}`} />
              <AvatarFallback style={{ backgroundColor: assistantColor }}>
                <BotIcon className="w-5 h-5 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                Test {assistant.name || "Assistant"}
              </h2>
              <p className="text-lg text-muted-foreground">
                Test this assistant with your questions
              </p>
            </div>

            <p className="text-lg text-red-500">
              Knowledgebase is not connected
            </p>

            <div className="flex items-center gap-4">
              <Button
                variant="default"
                onClick={handleClearMessages}
                disabled={messages.length === 0 && !isLoading}
                className="p-2 hover:bg-red-500"
                title="New Chat"
              >
                New Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0 hover:bg-muted"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.length === 0 && streamingContent === null ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <BotIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Welcome!</p>
                    <p className="text-sm">
                      Start a conversation with {assistant.name || "Assistant"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-xl shadow-md transition-all ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card text-foreground border rounded-tl-none"
                        }`}
                        style={{
                          borderLeft: `4px solid ${
                            message.role === "assistant"
                              ? assistantColor
                              : "transparent"
                          }`,
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {/* Live streaming message */}
                  {streamingContent !== null && (
                    <motion.div
                      key="streaming-message"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div
                        className="max-w-3xl p-4 rounded-xl shadow-md bg-card text-foreground border rounded-tl-none"
                        style={{ borderLeft: `4px solid ${assistantColor}` }}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {streamingContent}
                          <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {/* Loading indicator (before stream starts) */}
                  {isLoading && streamingContent === null && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div
                        className="bg-card p-4 rounded-xl border rounded-tl-none"
                        style={{ borderLeft: `4px solid ${assistantColor}` }}
                      >
                        <div className="flex space-x-1 items-center">
                          <span
                            className="text-sm font-medium pr-2"
                            style={{ color: assistantColor }}
                          >
                            {assistant.name || "Assistant"} is thinking
                          </span>
                          {/* Loading dots animation */}
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-2 rounded-full bg-current animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-current animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-current animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-6 pt-0 border-t bg-background/95">
            {messages.length === 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Quick Start Prompts:
                </h3>
                <AISuggestions>
                  {starterPrompts.map((suggestion) => (
                    <AISuggestion
                      key={suggestion}
                      suggestion={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="transition-all hover:bg-muted-foreground/10 text-xs sm:text-sm"
                    />
                  ))}
                </AISuggestions>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <PromptInput
                onSubmit={handleSubmit}
                className="flex-1 flex items-center gap-3"
              >
                <PromptInputTextarea
                  placeholder={`Message ${assistant.name || "Assistant"}...`}
                  disabled={isLoading}
                  className="flex-1 min-h-[48px] max-h-32 py-3 px-4 text-sm border-0 bg-transparent focus:outline-none resize-none"
                />
                <PromptInputSubmit
                  status={isLoading ? "submitted" : "ready"}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-lg border-none shadow-sm transition-all"
                  style={{ backgroundColor: assistantColor }}
                >
                  <Send className="w-4 h-4 text-white" />
                </PromptInputSubmit>
              </PromptInput>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
