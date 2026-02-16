"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { ArrowLeft, Plus, Edit, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSortHeader, useTableSort } from "@/components/ui/table-sort";
import { DataTable, Column } from "@/components/ui/data-table";
import { useLotteryTypesPaginated, LotteryType } from "@/hooks/use-lottery-types-paginated";

export default function LotteryTypesPage() {
  const { types, loading, pagination, refetch, setPage } = useLotteryTypesPaginated();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const filteredTypes = Array.isArray(types) ? types.filter((type) => {
    const matchesSearch = 
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || type.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Define columns
  const columns: Column<LotteryType>[] = [
    {
      key: "name",
      header: "ชื่อประเภทหวย",
      sortKey: "name",
      render: (type) => <span className="font-medium">{type.name}</span>,
    },
    {
      key: "code",
      header: "รหัส",
      sortKey: "code",
      render: (type) => (
        <code className="px-2.5 py-1 bg-slate-50 rounded text-sm font-medium text-slate-600">
          {type.code}
        </code>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (type) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            type.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {type.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "วันที่สร้าง",
      sortKey: "createdAt",
      render: (type) => type.createdAt ? new Date(type.createdAt).toLocaleDateString("th-TH") : "-",
    },
    {
      key: "actions",
      header: "การจัดการ",
      headerClassName: "text-right",
      className: "text-right",
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            จัดการประเภทหวย
          </h1>
          <p className="text-slate-600">จัดการประเภทหวยต่างๆ ในระบบ</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มประเภทหวย
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          {/* Search and Filter */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-slate-300"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 h-10 text-sm border-slate-300"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </Select>
          </div>

            <DataTable
              columns={columns}
              data={filteredTypes}
              loading={loading}
              pagination={
                pagination.totalPages > 1 && !searchQuery && statusFilter === "all"
                  ? {
                      currentPage: pagination.page,
                      totalPages: pagination.totalPages,
                      totalItems: pagination.total,
                      itemsPerPage: pagination.limit,
                      onPageChange: handlePageChange,
                    }
                  : undefined
              }
              searchQuery={searchQuery}
              emptyState={{
                title: "ไม่พบข้อมูล",
                description:
                  searchQuery || statusFilter !== "all"
                    ? "ไม่พบประเภทหวยที่ตรงกับเงื่อนไขการค้นหา"
                    : "ยังไม่มีประเภทหวยในระบบ",
              }}
            />
          </CardContent>
        </Card>
    </div>
  );
}
