"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSortHeader, useTableSort, SortDirection } from "@/components/ui/table-sort";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortKey?: string;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  searchQuery?: string;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: LucideIcon;
  };
  enableSorting?: boolean;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  searchQuery,
  emptyState,
  enableSorting = true,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const { sortedData, sort, handleSort } = useTableSort(data);

  const displayData = enableSorting ? sortedData : data;
  const showPagination = pagination && pagination.totalPages > 1 && !searchQuery;

  if (loading) {
    return (
      <div className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <div className="h-4 bg-slate-100 animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title || "ไม่พบข้อมูล"}
        description={emptyState?.description}
        icon={emptyState?.icon}
      />
    );
  }

  return (
    <>
      <div className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                if (enableSorting && column.sortKey) {
                  return (
                    <TableSortHeader
                      key={column.key}
                      sortKey={column.sortKey}
                      currentSort={sort}
                      onSort={handleSort}
                      className={column.headerClassName}
                    >
                      {column.header}
                    </TableSortHeader>
                  );
                }
                return (
                  <TableHead key={column.key} className={column.headerClassName}>
                    {column.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item, index) => {
              // Get key from item if available, otherwise use index
              const rowKey = item.id || item.key || index;
              const className = rowClassName ? rowClassName(item, index) : undefined;
              return (
                <TableRow
                  key={rowKey}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    className
                  )}
                  onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : (item[column.key] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="mt-6 animate-fade-in">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </>
  );
}
