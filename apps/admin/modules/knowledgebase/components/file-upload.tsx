"use client";

import { useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  isDragOver: boolean;
  selectedAssistant: string;
  onDragOver: (isDragOver: boolean) => void;
  onFileDrop: (files: File[]) => void;
  onFileSelect: (files: File[]) => void;
}

export function FileUpload({
  isDragOver,
  selectedAssistant,
  onDragOver,
  onFileDrop,
  onFileSelect,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(true);
  };

  const handleDragLeave = () => {
    onDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFileDrop(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-500">
          Supports PDF, DOCX, TXT, and more
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc,.txt,.md"
        />
      </div>
      <Button
        className="w-full mt-4"
        disabled={!selectedAssistant}
        onClick={handleClick}
      >
        Select Files
      </Button>
    </div>
  );
}
