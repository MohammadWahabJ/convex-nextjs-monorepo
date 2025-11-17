"use client";

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
  AISuggestion,
  AISuggestions,
} from "@workspace/ui/components/ai/suggestion";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { FileUIPart } from "ai";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export const AssistantView = () => {
  const router = useRouter();
  const t = useTranslations("assistant_view");
  const assistants = useQuery(api.web.assistants.getAssistants);
  const createConversation = useAction(api.web.conversations.create);
  const generateUploadUrl = useMutation(
    api.web.conversations.generateUploadUrl
  );
  const [selectedAssistant, setSelectedAssistant] = useState<
    Id<"assistants"> | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (assistants && assistants.length > 0 && !selectedAssistant) {
      const firstAssistant = assistants[0];
      if (firstAssistant) {
        setSelectedAssistant(firstAssistant._id);
      }
    }
  }, [assistants, selectedAssistant]);

  useEffect(() => {
    if (assistants !== undefined) {
      setIsLoadingData(false);
    }
  }, [assistants]);

  const handleSubmit = async ({
    text,
    files,
  }: {
    text?: string;
    files?: FileUIPart[];
  }) => {
    if (isLoading || !selectedAssistant || (!text && !files?.length)) return;

    setIsLoading(true);
    try {
      const attachments = files
        ? await Promise.all(
            files.map(async (file) => {
              try {
                const postUrl = await generateUploadUrl();
                const blob = await fetch(file.url).then((res) => res.blob());
                const result = await fetch(postUrl, {
                  method: "POST",
                  headers: { "Content-Type": file.mediaType },
                  body: blob,
                });

                if (!result.ok) {
                  throw new Error(`Upload failed: ${result.statusText}`);
                }

                const { storageId } = await result.json();
                return {
                  storageId,
                  filename: file.filename!,
                  mediaType: file.mediaType,
                };
              } catch (error) {
                console.error(`Failed to upload file ${file.filename}:`, error);
                throw error;
              }
            })
          )
        : undefined;

      const threadId = await createConversation({
        prompt: text ?? "",
        assistantId: selectedAssistant,
        attachments,
      });
      router.push(`/assistant/${threadId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading || !selectedAssistant) {
      return;
    }
    setIsLoading(true);
    try {
      const threadId = await createConversation({
        prompt: suggestion,
        assistantId: selectedAssistant,
      });
      router.push(`/assistant/${threadId}`);
    } catch (error) {
      console.error("Error creating conversation from suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentAssistant = assistants?.find(
    (a) => a?._id === selectedAssistant
  );

  console.log(assistants, "assistants")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="w-full max-w-5xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-foreground">
          {t("title")}
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t("description")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="wait">
            {isLoadingData ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center items-center h-32"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </motion.div>
            ) : assistants && assistants.length > 0 ? (
              assistants.map((assistant) => (
                <motion.div
                  key={assistant._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                      selectedAssistant === assistant._id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedAssistant(assistant._id)}
                  >
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/default-avatar.png" />
                        <AvatarFallback>{assistant.name[0]}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg font-semibold truncate">
                        {assistant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {t("ai_companion_ready")}
                      </p>
                      <Button
                        variant={
                          selectedAssistant === assistant._id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-full"
                      >
                        {selectedAssistant === assistant._id ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t("selected")}
                          </>
                        ) : (
                          t("select")
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center h-32"
              >
                <p className="text-muted-foreground">{t("no_assistants")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-background/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <PromptInput
                onSubmit={handleSubmit}
                accept="image/*,application/pdf"
                multiple
              >
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea
                  placeholder={
                    currentAssistant
                      ? t("ask_anything", {
                          assistantName: currentAssistant.name,
                        })
                      : t("select_assistant_to_chat")
                  }
                  disabled={isLoading || !selectedAssistant}
                  className=""
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
                    disabled={isLoading || !selectedAssistant}
                  ></PromptInputSubmit>
                </PromptInputToolbar>
              </PromptInput>
              {currentAssistant?.starterPrompt &&
                currentAssistant.starterPrompt.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {t("try_suggestions")}
                    </h3>
                    <AISuggestions>
                      {currentAssistant.starterPrompt.map((suggestion) => (
                        <AISuggestion
                          key={suggestion}
                          suggestion={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading || !selectedAssistant}
                          className="transition-all hover:bg-primary/10"
                        />
                      ))}
                    </AISuggestions>
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
