"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

interface UseUrlSubmissionProps {
  selectedAssistant: string;
  assistants: any[] | undefined;
  includeImages: boolean;
  includeDocuments: boolean;
  frequency: string;
  onSuccess: (type: string, url: string) => void;
  onError: (error: string) => void;
}

export function useUrlSubmission({
  selectedAssistant,
  assistants,
  includeImages,
  includeDocuments,
  frequency,
  onSuccess,
  onError,
}: UseUrlSubmissionProps) {
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const submitSingleUrl = useAction(
    api.superadmin.knowledgebase.submitSingleUrl
  );

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async (type: string, url: string) => {
    if (!selectedAssistant || !url.trim()) {
      onError("Please select an assistant and enter a valid URL");
      return;
    }

    // if (!validateUrl(url)) {
    //   onError("Please enter a valid URL (e.g., https://example.com)");
    //   return;
    // }

    setIsSubmittingUrl(true);

    try {
      const taskId = generateUUID();
      const workflowId = "mLz71VI5YSODOOak"; //NEED TO FIX

      // Get selected assistant details for collection name
      const selectedAssistantData = assistants?.find(
        (a: any) => a._id === selectedAssistant
      );
      // const collectionName = selectedAssistantData?.name || selectedAssistant;
      const collectionName = "test-qdrant-convex";

      const payload = {
        assistantId: selectedAssistant,
        collectionName: collectionName,
        uploadedBy: "admin",
        sourceUrl: url,
        includeImg: includeImages,
        includeDoc: includeDocuments,
        taskId: taskId,
        frequency: frequency,
        workflowId: workflowId,
        storeType: "other",
      };

      console.log("Submitting URL with parameters:", payload);

      const result = await submitSingleUrl(payload);

      if (result.success) {
        onSuccess(type, url);
      } else {
        onError(`Failed to submit URL: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting URL:", error);
      onError(
        `Error submitting URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  return {
    isSubmittingUrl,
    handleUrlSubmit,
  };
}
