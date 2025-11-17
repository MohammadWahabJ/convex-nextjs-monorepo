"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { FileText, Pencil, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useConvex } from "convex/react";
import { useUser, useAuth } from "@clerk/nextjs";
import { pdf } from "@react-pdf/renderer";

import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog";
import { api } from "@workspace/backend/_generated/api";
import { EditTitleDialog } from "@/components/dialogs/edit-title-dialog";
import { useState, useEffect } from "react";
import { ChatDocument } from "./ui/chat-document";
import { toast } from "sonner";

export type History = {
  id: string;
  title: string;
  updatedAt: string;
  assistantName: string;
};

export const columns: ColumnDef<History>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "assistantName",
    header: "Assistant",
  },
  {
    accessorKey: "updatedAt",
    header: "Date",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const router = useRouter();
      const { user } = useUser();
      const { orgId } = useAuth();
      const convex = useConvex();
      const history = row.original;

      const deleteThread = useAction(api.web.history.deleteThread);
      const updateThreadTitle = useMutation(api.web.history.updateThreadTitle);

      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);
      const [isGenerateSuccessOpen, setIsGenerateSuccessOpen] = useState(false);
      const [isGenerating, setIsGenerating] = useState(false);
      const [pdfUrl, setPdfUrl] = useState<string | null>(null);

      useEffect(() => {
        // Clean up the object URL when the component unmounts or the URL changes
        return () => {
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
        };
      }, [pdfUrl]);

      const handleDelete = () => {
        deleteThread({ threadId: history.id });
      };

      const handleUpdateTitle = (newTitle: string) => {
        updateThreadTitle({ threadId: history.id, title: newTitle });
      };

      const handleGenerateDocument = async () => {
        setIsGenerateConfirmOpen(false);
        setIsGenerating(true);
        toast.info("Generating document...");

        try {
          const messages = await convex.query(api.web.history.getMessagesByThreadId, { threadId: history.id });
          if (!messages || messages.length === 0) {
            toast.error("No messages found to generate a document.");
            setIsGenerating(false);
            return;
          }

          const doc = (
            <ChatDocument
              messages={messages}
              user={user}
              orgId={orgId}
              title={history.title}
            />
          );
          const blob = await pdf(doc).toBlob();
          const url = URL.createObjectURL(blob);

          setPdfUrl(url);
          setIsGenerating(false);
          toast.success("Document generated successfully!");
          setIsGenerateSuccessOpen(true);
        } catch (error) {
          console.error("Failed to generate PDF:", error);
          toast.error("Failed to generate document.");
          setIsGenerating(false);
        }
      };

      const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${history.title.replace(/\s+/g, "_")}_chat.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsGenerateSuccessOpen(false);
      };

      const handleViewOnline = () => {
        if (pdfUrl) {
          window.open(pdfUrl, "_blank");
        }
        setIsGenerateSuccessOpen(false);
      };

      return (
        <>
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              title="Edit Title"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </Button>
            <ConfirmationDialog
              title="Generate Document?"
              description="This will generate a PDF document based on the chat history."
              onConfirm={handleGenerateDocument}
              isOpen={isGenerateConfirmOpen}
              onOpenChange={setIsGenerateConfirmOpen}
            >
              <Button
                variant="ghost"
                size="icon"
                title="Generate Document"
                onClick={() => setIsGenerateConfirmOpen(true)}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4 text-green-500 hover:text-green-700" />
              </Button>
            </ConfirmationDialog>
            <ConfirmationDialog
              title="Are you sure?"
              description="This action cannot be undone. This will permanently delete the chat history."
              onConfirm={handleDelete}
            >
              <Button variant="ghost" size="icon" title="Delete">
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </Button>
            </ConfirmationDialog>
            <Button
              variant="ghost"
              size="icon"
              title="Continue Chat"
              onClick={() => router.push(`/assistant/${history.id}`)}
            >
              <Play className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </Button>
          </div>
          <EditTitleDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleUpdateTitle}
            initialTitle={history.title}
            title="Edit Title"
            description="Enter a new title for the chat history."
          />
          <ConfirmationDialog
            title="Document Generated Successfully"
            description="Your document is ready to be downloaded or viewed online."
            onConfirm={handleDownload}
            confirmText="Download"
            onCancel={handleViewOnline}
            cancelText="View Online"
            isOpen={isGenerateSuccessOpen}
            onOpenChange={setIsGenerateSuccessOpen}
          />
        </>
      );
    },
  },
];
