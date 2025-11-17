'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog";

export type Knowledgebase = {
  id: string;
  title: string;
  sourceType: 'Link' | 'Document';
  fileSize: string;
  status: 'Pending' | 'Completed' | 'Not Found' | 'Error';
  createdAt: string;
  updatedBy: string;
};

const getStatusBadge = (status: Knowledgebase['status']) => {
  switch (status) {
    case 'Completed':
      return <Badge variant="default">Completed</Badge>;
    case 'Pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'Not Found':
      return <Badge variant="destructive">Not Found</Badge>;
    case 'Error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const columns: ColumnDef<Knowledgebase>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'sourceType',
    header: 'Source Type',
  },
  {
    accessorKey: 'fileSize',
    header: 'File Size',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: 'updatedBy',
    header: 'Updated By',
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const handleDelete = () => {
        // TODO: Implement delete logic
        console.log('Deleting', row.original.id);
      };

      return (
        <div className="flex items-center justify-end space-x-1">
          <ConfirmationDialog
            title="Are you sure?"
            description="This action cannot be undone. This will permanently delete the item."
            onConfirm={handleDelete}
          >
            <Button variant="ghost" size="icon" title="Delete">
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </Button>
          </ConfirmationDialog>
        </div>
      );
    },
  },
];