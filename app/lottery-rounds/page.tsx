"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/form-input";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSortHeader, useTableSort } from "@/components/ui/table-sort";
import { DataTable, Column } from "@/components/ui/data-table";
import { useLotteryTypes } from "@/hooks/use-lottery-types";
import { useLotteryRounds, LotteryRound } from "@/hooks/use-lottery-rounds";

const createRoundSchema = z.object({
  lotteryTypeId: z.string().min(1, "กรุณาเลือกประเภทหวย"),
  roundNumber: z.string().min(1, "กรุณากรอกรอบ"),
  openTime: z.string().min(1, "กรุณาเลือกเวลาเปิด"),
  closeTime: z.string().min(1, "กรุณาเลือกเวลาปิด"),
});

export default function LotteryRoundsPage() {
  const { types } = useLotteryTypes();
  const { rounds, loading, pagination, refetch, createRound, setPage } = useLotteryRounds();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const form = useForm({
    resolver: zodResolver(createRoundSchema),
    defaultValues: {
      lotteryTypeId: "",
      roundNumber: "",
      openTime: "",
      closeTime: "",
    },
  });


  const onSubmit = async (data: z.infer<typeof createRoundSchema>) => {
    try {
      await createRound(data);
      alert("สร้างรอบหวยสำเร็จ");
      form.reset();
      setShowForm(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const filteredRounds = Array.isArray(rounds) ? rounds.filter((round) => {
    const matchesSearch = 
      round.roundNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      round.lotteryType.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || round.status === statusFilter;
    const matchesType = typeFilter === "all" || round.lotteryType.id === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  // Flatten for sorting
  const roundsForTable = filteredRounds.map((round) => ({
    ...round,
    lotteryTypeName: round.lotteryType.name,
  }));

  // Define columns
  const columns: Column<typeof roundsForTable[0]>[] = [
    {
      key: "lotteryTypeName",
      header: "ประเภทหวย",
      sortKey: "lotteryTypeName",
      render: (round) => <span className="font-medium">{round.lotteryType.name}</span>,
    },
    {
      key: "roundNumber",
      header: "รอบ",
      sortKey: "roundNumber",
    },
    {
      key: "openTime",
      header: "เวลาเปิด",
      sortKey: "openTime",
      render: (round) => new Date(round.openTime).toLocaleString("th-TH"),
    },
    {
      key: "closeTime",
      header: "เวลาปิด",
      sortKey: "closeTime",
      render: (round) => new Date(round.closeTime).toLocaleString("th-TH"),
    },
    {
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (round) => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
            round.status === "open"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : round.status === "completed"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700"
          }`}
        >
          {round.status === "open"
            ? "เปิดรับแทง"
            : round.status === "completed"
            ? "เสร็จสิ้น"
            : "ปิดรับแทง"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            จัดการรอบหวย
          </h1>
          <p className="text-slate-600">สร้างและจัดการรอบหวย</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          สร้างรอบใหม่
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 animate-scale-in">
            <CardHeader>
              <CardTitle>สร้างรอบหวยใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        ประเภทหวย
                      </label>
                      <select
                        {...form.register("lotteryTypeId")}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">เลือกประเภทหวย</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <FormInput
                      control={form.control}
                      name="roundNumber"
                      label="รอบ"
                      placeholder="เช่น 1/2567"
                    />
                    <FormInput
                      control={form.control}
                      name="openTime"
                      label="เวลาเปิดรับแทง"
                      type="datetime-local"
                    />
                    <FormInput
                      control={form.control}
                      name="closeTime"
                      label="เวลาปิดรับแทง"
                      type="datetime-local"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">สร้างรอบ</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>รายการรอบหวย</CardTitle>
            <CardDescription>รายการรอบหวยทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารอบหรือประเภทหวย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">ทุกประเภทหวย</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="open">เปิดรับแทง</option>
                <option value="closed">ปิดรับแทง</option>
                <option value="completed">เสร็จสิ้น</option>
              </Select>
            </div>

            <DataTable
              columns={columns}
              data={roundsForTable}
              loading={loading}
              pagination={
                pagination.totalPages > 1 && !searchQuery && statusFilter === "all" && typeFilter === "all"
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
                  searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "ไม่พบรอบหวยที่ตรงกับเงื่อนไขการค้นหา"
                    : "ยังไม่มีรอบหวยในระบบ",
              }}
            />
          </CardContent>
        </Card>
    </div>
  );
}
