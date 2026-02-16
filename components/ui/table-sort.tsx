"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

interface TableSortHeaderProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: {
    key: string;
    direction: SortDirection;
  };
  onSort?: (key: string) => void;
  className?: string;
}

export function TableSortHeader({
  children,
  sortKey,
  currentSort,
  onSort,
  className,
}: TableSortHeaderProps) {
  if (!sortKey || !onSort) {
    return <TableHead className={className}>{children}</TableHead>;
  }

  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort?.direction : null;

  const handleClick = () => {
    onSort(sortKey);
  };

  return (
    <TableHead className={className}>
      <button
        className={cn(
          "flex items-center gap-2 h-auto w-full text-left font-medium text-slate-600 hover:text-slate-700 transition-colors",
          isActive && "text-blue-600"
        )}
        onClick={handleClick}
      >
        {children}
        <span className={cn(
          "transition-all duration-200 text-slate-400",
          isActive && "text-blue-600"
        )}>
          {direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : direction === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          )}
        </span>
      </button>
    </TableHead>
  );
}

export function useTableSort<T extends Record<string, any>>(
  data: T[],
  defaultSort?: { key: string; direction: SortDirection }
) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>(
    defaultSort || { key: "", direction: null }
  );

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key === key) {
        // Toggle direction
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: "", direction: null };
        } else {
          return { key, direction: "asc" };
        }
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc"
          ? aValue.localeCompare(bValue, "th")
          : bValue.localeCompare(aValue, "th");
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle date comparison (string dates)
      if (typeof aValue === "string" && typeof bValue === "string") {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sort.direction === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
      }

      // Fallback: convert to string and compare
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sort.direction === "asc"
        ? aStr.localeCompare(bStr, "th")
        : bStr.localeCompare(aStr, "th");
    });
  }, [data, sort]);

  return {
    sortedData,
    sort,
    handleSort,
  };
}
