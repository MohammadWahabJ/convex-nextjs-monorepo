"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { FileText, Link, Globe, Trash2 } from "lucide-react";

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

interface KnowledgeBaseTableProps {
  filteredData: KnowledgeBaseItem[];
  selectedAssistant: string;
  allKnowledgeItems: any[];
  paginatedKnowledgeItems: any;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function KnowledgeBaseTable({
  filteredData,
  selectedAssistant,
  allKnowledgeItems,
  paginatedKnowledgeItems,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: KnowledgeBaseTableProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      deleted: "bg-gray-100 text-gray-800",
      "not found": "bg-orange-100 text-orange-800",
    };
    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      document: <FileText size={16} />,
      link: <Link size={16} />,
      sitemap: <Globe size={16} />,
      text: <FileText size={16} />,
    };
    return icons[type as keyof typeof icons] || <FileText size={16} />;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={item.source}>
                  {item.source}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{item.fileSize}</TableCell>
                <TableCell>{item.assistant}</TableCell>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!selectedAssistant ? (
          <div className="text-center py-8 text-gray-500">
            Please select an assistant to view knowledge base entries.
          </div>
        ) : selectedAssistant &&
          allKnowledgeItems.length === 0 &&
          !paginatedKnowledgeItems ? (
          <div className="text-center py-8 text-gray-500">
            Loading knowledge base entries...
          </div>
        ) : filteredData.length === 0 && allKnowledgeItems.length > 0 ? (
          <div className="text-center py-8 text-gray-500">
            No entries found matching your criteria.
          </div>
        ) : selectedAssistant && allKnowledgeItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No knowledge base entries found for this assistant.
          </div>
        ) : null}
      </div>

      {/* Load More Button */}
      {selectedAssistant && hasMore && filteredData.length > 0 && (
        <div className="p-4 border-t">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full"
            variant="outline"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
