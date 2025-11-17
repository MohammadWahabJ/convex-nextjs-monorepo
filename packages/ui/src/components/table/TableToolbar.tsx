'use client';

import { Table } from '@tanstack/react-table';
import { X, Trash2 } from 'lucide-react';

import { DataTableFacetedFilter } from './TableFactedFilter';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
// import { ConfirmationDialog } from '@workspace/web/components/dialogs/confirmation-dialog';
import { TableViewOptions } from './TableOption';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  filterColumn?: string;
  facetedFilters?: {
    column: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export function TableToolbar<TData>({
  table,
  filterColumn,
  facetedFilters = [],
}: TableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  const handleDeleteSelected = () => {
    // TODO: Implement delete logic for selected rows
    console.log('Deleting selected rows', table.getFilteredSelectedRowModel().rows.map(row => (row.original as any).id));
    table.resetRowSelection();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filterColumn && table.getColumn(filterColumn) && (
          <Input
            placeholder="Keyword"
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] dark:border dark:border-gray-500 dark:bg-transparent lg:w-[250px] "
          />
        )}

        {Array.isArray(facetedFilters) &&
          facetedFilters.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) {
              console.warn(`Column ${filter.column} not found in table`);
              return null;
            }

            return (
              <DataTableFacetedFilter
                key={filter.column}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {/* {numSelected > 0 && (
          // <ConfirmationDialog
          //   title="Are you sure?"
          //   description={`This will permanently delete ${numSelected} item(s).`}
          //   onConfirm={handleDeleteSelected}
          // >
          //   <Button variant="destructive" className="mr-2">
          //     <Trash2 className="mr-2 h-4 w-4" />
          //     Delete Selected ({numSelected})
          //   </Button>
          // </ConfirmationDialog>
        )} */}
        <TableViewOptions table={table} />
      </div>
    </div>
  );
}
