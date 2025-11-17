'use client';
import React, { useState } from 'react';
import KnowledgebaseTable from '@/modules/knowledgebase/ui/knowledgebase-table';
import { Button } from '@workspace/ui/components/button';
import { PlusCircle } from 'lucide-react';
import { NewKnowledgebaseItemDialog } from '@/components/dialogs/new-knowledgebase-item-dialog';

const KnowledgebasePage = () => {
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);

  const handleNewItem = async (
    title: string, 
    sourceType: 'single-url' | 'entire-website' | 'sitemap-url' | 'page-sublinks' | 'document', 
    data: File | string
  ) => {
    // TODO: Implement new item logic
    console.log('Creating new item with title:', title, 'and source type:', sourceType);
    if (sourceType === 'document') {
      console.log('File:', data as File);
    } else {
      console.log('URL:', data as string);
    }
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsNewItemDialogOpen(false);
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Knowledgebase</h1>
          <p className="text-sm text-gray-500">
            Here you can see all the knowledgebase.
          </p>
        </div>
        <Button onClick={() => setIsNewItemDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>
      <div className="p-4 sm:p-6">
        <KnowledgebaseTable />
      </div>
      <NewKnowledgebaseItemDialog
        isOpen={isNewItemDialogOpen}
        onClose={() => setIsNewItemDialogOpen(false)}
        onSave={handleNewItem}
      />
    </div>
  );
};

export default KnowledgebasePage;