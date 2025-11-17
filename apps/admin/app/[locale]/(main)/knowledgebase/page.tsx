/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Link, Upload, Database, FileText } from "lucide-react";
import {
  FileUpload,
  ProcessingOptions,
  UrlTabs,
  AssistantSelector,
  Filters,
  KnowledgeBaseTable,
  useUrlSubmission,
} from "@/modules/knowledgebase/components";
// import { useUrlSubmission } from "@/modules/knowledgebase/components/use-url-submission";

interface KnowledgeBaseItem {
  id: string;
  name: string;
  type: string;
  source: string;
  status: string;
  createdAt: string;
  fileSize: string;
  assistant: string;
}

const KnowledgeBasePage = () => {
  // State management
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [singleUrl, setSingleUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allKnowledgeItems, setAllKnowledgeItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [frequency, setFrequency] = useState("never");

  // API queries
  const assistants = useQuery(
    api.superadmin.assistant.getAssistantsByOrganizationAndType,
    {
      type: "custom",
    }
  );
  const paginatedKnowledgeItems = useQuery(
    api.superadmin.knowledgebase.getKnowledgeBasesWithPagination,
    selectedAssistant
      ? {
          paginationOpts: {
            numItems: 10,
            cursor: cursor || undefined,
          },
          assistantId: selectedAssistant as any,
        }
      : "skip"
  );

  // URL submission hook
  const { isSubmittingUrl, handleUrlSubmit } = useUrlSubmission({
    selectedAssistant,
    assistants,
    includeImages,
    includeDocuments,
    frequency,
    onSuccess: (type: string, url: string) => {
      alert(`Successfully submitted ${type} URL: ${url}`);
      // Clear the input based on type
      if (type === "single") setSingleUrl("");
      else if (type === "sitemap") setSitemapUrl("");
      else if (type === "website") setWebsiteUrl("");

      // Refresh the knowledge base list
      setAllKnowledgeItems([]);
      setCursor(null);
      setHasMore(true);
    },
    onError: (error: string) => {
      alert(error);
    },
  });

  // Handle pagination data and reset when assistant changes
  useEffect(() => {
    if (paginatedKnowledgeItems) {
      if (cursor === null) {
        setAllKnowledgeItems(paginatedKnowledgeItems.page);
      } else {
        setAllKnowledgeItems((prev) => [
          ...prev,
          ...paginatedKnowledgeItems.page,
        ]);
        setIsLoadingMore(false);
      }
      setHasMore(paginatedKnowledgeItems.isDone === false);
    }
  }, [paginatedKnowledgeItems, cursor]);

  // Reset data when assistant changes
  useEffect(() => {
    setAllKnowledgeItems([]);
    setCursor(null);
    setHasMore(true);
  }, [selectedAssistant]);

  // Load more handler
  const handleLoadMore = () => {
    if (paginatedKnowledgeItems?.continueCursor && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCursor(paginatedKnowledgeItems.continueCursor);
    }
  };

  // File handlers
  const handleFileDrop = (files: File[]) => {
    console.log("Dropped files:", files);
    // TODO: Handle file upload
  };

  const handleFileSelect = (files: File[]) => {
    console.log("Selected files:", files);
    // TODO: Handle file upload
  };

  // Transform data for table
  const rawData: KnowledgeBaseItem[] =
    selectedAssistant && allKnowledgeItems.length > 0
      ? allKnowledgeItems.map((item: any) => ({
          id: item._id,
          name: item.title,
          type: item.fileType,
          source: item.source_url || item.storageId || "Unknown",
          status: item.status,
          createdAt: new Date(item._creationTime).toLocaleDateString(),
          fileSize: item.fileSize
            ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB`
            : "Unknown",
          assistant:
            assistants?.find((a: any) => a._id === item.assistantId)?.name ||
            "Unknown",
        }))
      : [];

  // Filter data based on search and filters
  const filteredData = rawData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <AssistantSelector
          selectedAssistant={selectedAssistant}
          onAssistantChange={setSelectedAssistant}
          assistants={assistants}
        />
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="submission" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submission" className="flex items-center gap-2">
            <FileText size={16} />
            Document & URL Submission
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database size={16} />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        {/* Document & URL Submission Tab */}
        <TabsContent value="submission" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* URL Input Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link size={20} />
                  Add URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProcessingOptions
                  includeImages={includeImages}
                  includeDocuments={includeDocuments}
                  frequency={frequency}
                  onIncludeImagesChange={setIncludeImages}
                  onIncludeDocumentsChange={setIncludeDocuments}
                  onFrequencyChange={setFrequency}
                />

                <UrlTabs
                  singleUrl={singleUrl}
                  sitemapUrl={sitemapUrl}
                  websiteUrl={websiteUrl}
                  isSubmittingUrl={isSubmittingUrl}
                  selectedAssistant={selectedAssistant}
                  onSingleUrlChange={setSingleUrl}
                  onSitemapUrlChange={setSitemapUrl}
                  onWebsiteUrlChange={setWebsiteUrl}
                  onUrlSubmit={handleUrlSubmit}
                />
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  isDragOver={isDragOver}
                  selectedAssistant={selectedAssistant}
                  onDragOver={setIsDragOver}
                  onFileDrop={handleFileDrop}
                  onFileSelect={handleFileSelect}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Entries</CardTitle>
              <Filters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </CardHeader>

            <CardContent className="p-0">
              <KnowledgeBaseTable
                filteredData={filteredData}
                selectedAssistant={selectedAssistant}
                allKnowledgeItems={allKnowledgeItems}
                paginatedKnowledgeItems={paginatedKnowledgeItems}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBasePage;
