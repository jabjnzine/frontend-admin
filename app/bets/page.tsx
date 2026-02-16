"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Search, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { useBets, Bet } from "@/hooks/use-bets";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const getBetStatusColor = (status: string) => {
  switch (status) {
    case "won":
      return "bg-green-100 text-green-800 border-green-200";
    case "lost":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const getBetStatusLabel = (status: string) => {
  switch (status) {
    case "won":
      return "ชนะ";
    case "lost":
      return "แพ้";
    case "pending":
      return "รอผล";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
};

const getBetTypeLabel = (betType: string) => {
  switch (betType) {
    case "two_digit":
      return "2 ตัว";
    case "three_digit":
      return "3 ตัว";
    case "running":
      return "วิ่ง";
    case "set":
      return "ชุด";
    case "high_low":
      return "บนล่าง";
    case "todd":
      return "โต๊ด";
    case "odd_even":
      return "คู่/คี่";
    case "rood":
      return "รูด";
    default:
      return betType;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return format(new Date(date), "dd/MM/yyyy HH:mm");
};

export default function BetsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { bets, loading, pagination, refetch, setPage } = useBets({
    page: currentPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPage(page);
  };

  // Filter bets by search query (username or round number)
  const filteredBets = Array.isArray(bets) ? bets.filter((bet) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      bet.user?.username?.toLowerCase().includes(searchLower) ||
      bet.lotteryRound?.roundNumber?.toLowerCase().includes(searchLower) ||
      bet.lotteryRound?.lotteryType?.name?.toLowerCase().includes(searchLower)
    );
  }) : [];

  // Define columns
  const columns: Column<Bet>[] = [
    {
      key: "createdAt",
      header: "วันที่",
      sortKey: "createdAt",
      render: (bet) => (
        <span className="text-sm">{formatDate(bet.createdAt)}</span>
      ),
    },
    {
      key: "user",
      header: "ผู้ใช้",
      sortKey: "user.username",
      render: (bet) => (
        <div>
          <span 
            className="font-medium text-[#8B5CF6] hover:text-[#7C3AED] cursor-pointer hover:underline"
            onClick={() => router.push(`/users/${bet.userId}`)}
          >
            {bet.user?.username || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "lotteryRound",
      header: "รอบหวย",
      sortKey: "lotteryRound.roundNumber",
      render: (bet) => (
        <div>
          <span className="font-medium">{bet.lotteryRound?.roundNumber || "-"}</span>
          {bet.lotteryRound?.lotteryType && (
            <span className="text-xs text-slate-500 block">
              {bet.lotteryRound.lotteryType.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "betType",
      header: "ประเภท",
      sortKey: "betType",
      render: (bet) => (
        <Badge variant="outline">{getBetTypeLabel(bet.betType)}</Badge>
      ),
    },
    {
      key: "numbers",
      header: "เลขที่แทง",
      render: (bet) => (
        <div className="flex gap-1 flex-wrap">
          {bet.numbers.map((num, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {num}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "amount",
      header: "จำนวนเงิน",
      sortKey: "amount",
      className: "text-right",
      render: (bet) => (
        <span className="font-medium text-right">{formatCurrency(bet.amount)}</span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (bet) => (
        <Badge className={getBetStatusColor(bet.status)}>
          {getBetStatusLabel(bet.status)}
        </Badge>
      ),
    },
    {
      key: "payout",
      header: "รางวัล",
      sortKey: "payout",
      className: "text-right",
      render: (bet) => (
        <span className="text-right">
          {bet.payout ? (
            <span className="font-semibold text-green-600">
              {formatCurrency(bet.payout)}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
          จัดการการแทง
        </h1>
        <p className="text-slate-600">ดูการแทงทั้งหมดในระบบ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">รายการการแทง</CardTitle>
          <CardDescription>รายการการแทงทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อผู้ใช้, รอบหวย, หรือประเภทหวย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-sm"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48 h-11 text-sm">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอผล</SelectItem>
                <SelectItem value="won">ชนะ</SelectItem>
                <SelectItem value="lost">แพ้</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filteredBets}
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
                  ? "ไม่พบการแทงที่ตรงกับเงื่อนไขการค้นหา"
                  : "ยังไม่มีการแทงในระบบ",
              icon: Ticket,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
