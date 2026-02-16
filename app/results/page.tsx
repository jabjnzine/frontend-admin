"use client";

import { useEffect, useState } from "react";
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
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSortHeader, useTableSort } from "@/components/ui/table-sort";
import { DataTable, Column } from "@/components/ui/data-table";
import { useLotteryTypes } from "@/hooks/use-lottery-types";
import { useLotteryResults } from "@/hooks/use-lottery-results";
import { LotteryRound } from "@/hooks/use-lottery-rounds";

const resultSchema = z.object({
  firstPrize: z.string().optional(),
  lastTwoDigits: z.string().optional(),
  lastThreeDigits: z.string().optional(),
});

export default function ResultsPage() {
  const { rounds, loading, pagination, refetch, submitResult, setPage } = useLotteryResults();
  const [selectedRound, setSelectedRound] = useState<LotteryRound | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      firstPrize: "",
      lastTwoDigits: "",
      lastThreeDigits: "",
    },
  });


  useEffect(() => {
    if (selectedRound) {
      // Type assertion for result property
      const roundWithResult = selectedRound as LotteryRound & {
        result?: {
          firstPrize?: string;
          lastTwoDigits?: string;
          lastThreeDigits?: string;
        };
      };
      form.reset({
        firstPrize: roundWithResult.result?.firstPrize || "",
        lastTwoDigits: roundWithResult.result?.lastTwoDigits || "",
        lastThreeDigits: roundWithResult.result?.lastThreeDigits || "",
      });
    }
  }, [selectedRound, form]);

  const onSubmit = async (data: z.infer<typeof resultSchema>) => {
    if (!selectedRound) {
      alert("กรุณาเลือกรอบหวย");
      return;
    }

    try {
      await submitResult(selectedRound.id, {
        firstPrize: data.firstPrize || undefined,
        lastTwoDigits: data.lastTwoDigits || undefined,
        lastThreeDigits: data.lastThreeDigits || undefined,
      });
      alert("กรอกผลรางวัลสำเร็จ");
      form.reset();
      setSelectedRound(null);
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
    return (
      round.roundNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      round.lotteryType.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  // Flatten for table
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
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (round) => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
            round.status === "open"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700"
          }`}
        >
          {round.status === "open" ? "เปิดรับแทง" : "ปิดรับแทง"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
          กรอกผลรางวัล
        </h1>
        <p className="text-slate-600">เลือกรอบหวยและกรอกผลรางวัล</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">เลือกรอบหวย</CardTitle>
            <CardDescription>เลือกรอบหวยที่ต้องการกรอกผล</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="ค้นหารอบหรือประเภทหวย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>

              <div className="mb-4">
                <DataTable
                  columns={columns}
                  data={roundsForTable}
                  loading={loading}
                  pagination={
                    pagination.totalPages > 1 && !searchQuery
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
                      searchQuery
                        ? "ไม่พบรอบหวยที่ตรงกับเงื่อนไขการค้นหา"
                        : "ไม่มีรอบหวยที่พร้อมกรอกผล",
                  }}
                  enableSorting={true}
                  onRowClick={(item) => {
                    const round = filteredRounds.find(r => r.id === item.id);
                    if (round) setSelectedRound(round);
                  }}
                  rowClassName={(item) => {
                    return selectedRound?.id === item.id 
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500 shadow-md" 
                      : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30";
                  }}
                />
              </div>
              {!loading && roundsForTable.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  คลิกที่แถวเพื่อเลือกรอบหวยที่ต้องการกรอกผล
                </div>
              )}
            </CardContent>
          </Card>

          {selectedRound && (
            <Card>
              <CardHeader>
                <CardTitle>กรอกผลรางวัล</CardTitle>
                <CardDescription>
                  {selectedRound.lotteryType.name} - รอบ {selectedRound.roundNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                      control={form.control}
                      name="firstPrize"
                      label="รางวัลที่ 1"
                      placeholder="กรอกเลขรางวัลที่ 1"
                    />
                    <FormInput
                      control={form.control}
                      name="lastTwoDigits"
                      label="เลขท้าย 2 ตัว"
                      placeholder="กรอกเลขท้าย 2 ตัว"
                    />
                    <FormInput
                      control={form.control}
                      name="lastThreeDigits"
                      label="เลขท้าย 3 ตัว"
                      placeholder="กรอกเลขท้าย 3 ตัว"
                    />
                    <Button type="submit" className="w-full">
                      บันทึกผลรางวัล
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}
