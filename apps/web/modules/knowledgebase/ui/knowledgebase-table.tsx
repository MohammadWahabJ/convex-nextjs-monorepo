'use client';
import React from 'react';
import { FullPaginationTable } from '@workspace/ui/components/table/FullPaginationTable';
import { columns, Knowledgebase } from '../columns';
import { File, Link2 } from 'lucide-react';

const knowledgebaseData: Knowledgebase[] = [
  {
    id: '1',
    title: 'Introduction to our API',
    sourceType: 'Link',
    fileSize: '-',
    status: 'Completed',
    createdAt: '2024-05-20T10:00:00Z',
    updatedBy: 'Admin',
  },
  {
    id: '2',
    title: 'User Manual.pdf',
    sourceType: 'Document',
    fileSize: '2.5 MB',
    status: 'Pending',
    createdAt: '2024-05-19T14:30:00Z',
    updatedBy: 'Editor',
  },
  {
    id: '3',
    title: 'Pricing Information',
    sourceType: 'Link',
    fileSize: '-',
    status: 'Not Found',
    createdAt: '2024-05-18T09:00:00Z',
    updatedBy: 'Admin',
  },
  {
    id: '4',
    title: 'Troubleshooting Guide.docx',
    sourceType: 'Document',
    fileSize: '1.2 MB',
    status: 'Error',
    createdAt: '2024-05-17T11:45:00Z',
    updatedBy: 'Editor',
  },
  {
    id: '5',
    title: 'API Reference',
    sourceType: 'Link',
    fileSize: '-',
    status: 'Completed',
    createdAt: '2024-05-16T12:00:00Z',
    updatedBy: 'Admin',
  },
  {
    id: '6',
    title: 'Getting Started.pdf',
    sourceType: 'Document',
    fileSize: '0.5 MB',
    status: 'Completed',
    createdAt: '2024-05-15T09:30:00Z',
    updatedBy: 'Editor',
  },
];

const facetedFilters = [
  {
    column: 'status',
    title: 'Status',
    options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Not Found', value: 'Not Found' },
      { label: 'Error', value: 'Error' },
    ],
  },
  {
    column: 'sourceType',
    title: 'Source Type',
    options: [
      { label: 'Link', value: 'Link', icon: Link2 },
      { label: 'Document', value: 'Document', icon: File },
    ],
  },
];

const KnowledgebaseTable = () => {
  return <FullPaginationTable columns={columns} data={knowledgebaseData} filterColumn='title' facetedFilters={facetedFilters} hasCheckbox />;
};

export default KnowledgebaseTable;