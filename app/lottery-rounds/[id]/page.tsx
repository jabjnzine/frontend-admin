"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Trophy, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useRoundBets, RoundBet } from "@/hooks/use-round-bets";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import api from "@/lib/api";
import { LotteryRound } from "@/hooks/use-lottery-rounds";

export default function RoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params?.id as string;
  
  const { bets, loading, pagination, refetch, setPage } = useRoundBets({ roundId });
  const [round, setRound] = useState<LotteryRound | null>(null);
  const [loadingRound, setLoadingRound] = useState(true);

  useEffect(() => {
    if (roundId) {
      loadRoundData();
    }
  }, [roundId]);

  const loadRoundData = async () => {
    try {
      setLoadingRound(true);
      const response = await api.get(`/lottery/admin/rounds/${roundId}`);
      const roundData = response.data?.data || response.data;
      setRound(roundData);
    } catch (error) {
      console.error("Failed to load round data:", error);
    } finally {
      setLoadingRound(false);
    }
  };

  const getBetTypeLabel = (betType: string) => {
    const labels: Record<string, string> = {
      two_digit: "2 ตัว",
      three_digit: "3 ตัว",
      running: "วิ่ง",
      set: "ชุด",
      high_low: "บนล่าง",
      todd: "โต๊ด",
      odd_even: "คู่/คี่",
      rood: "รูด",
    };
    return labels[betType] || betType;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: "รอผล",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      won: {
        label: "ชนะ",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      lost: {
        label: "แพ้",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      cancelled: {
        label: "ยกเลิก",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoundStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      open: {
        label: "เปิดรับแทง",
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      },
      closed: {
        label: "ปิดรับแทง",
        className: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700",
      },
      completed: {
        label: "เสร็จสิ้น",
        className: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
      },
      drawing: {
        label: "กำลังจับรางวัล",
        className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
    };

    const config = statusConfig[status] || statusConfig.closed;
    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  // Calculate statistics
  const stats = {
    totalBets: bets.length,
    totalAmount: bets.reduce((sum, bet) => sum + Number(bet.amount), 0),
    wonBets: bets.filter((bet) => bet.status === "won").length,
    totalPayout: bets
      .filter((bet) => bet.status === "won" && bet.payout)
      .reduce((sum, bet) => sum + Number(bet.payout || 0), 0),
  };

  // Flatten for table
  const betsForTable = bets.map((bet) => ({
    ...bet,
    userName: bet.user?.username || bet.user?.email || "ไม่ระบุ",
    userFullName: bet.user?.firstName || bet.user?.lastName 
      ? `${bet.user.firstName || ""} ${bet.user.lastName || ""}`.trim()
      : null,
  }));

  // Define columns
  const columns: Column<typeof betsForTable[0]>[] = [
    {
      key: "userName",
      header: "ผู้ใช้",
      render: (bet) => (
        <div className="flex flex-col">
          <button
            onClick={() => handleUserClick(bet.userId)}
            className="text-left font-medium text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
          >
            {bet.userName}
          </button>
          {bet.userFullName && (
            <span className="text-xs text-gray-500">{bet.userFullName}</span>
          )}
        </div>
      ),
    },
    {
      key: "betType",
      header: "ประเภท",
      render: (bet) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {getBetTypeLabel(bet.betType)}
        </Badge>
      ),
    },
    {
      key: "numbers",
      header: "เลขที่แทง",
      render: (bet) => {
        // สำหรับรูปแบบการแทงพิเศษ ให้แสดงข้อความที่เข้าใจง่าย
        if (bet.betType === "high_low") {
          const choice = bet.numbers[0]?.toLowerCase();
          return (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {choice === "high" ? "บน (≥50)" : choice === "low" ? "ล่าง (<50)" : bet.numbers[0]}
            </span>
          );
        }
        if (bet.betType === "odd_even") {
          const choice = bet.numbers[0]?.toLowerCase();
          return (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {choice === "odd" ? "คี่" : choice === "even" ? "คู่" : bet.numbers[0]}
            </span>
          );
        }
        if (bet.betType === "todd") {
          const choice = bet.numbers[0]?.toLowerCase();
          return (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {choice === "todd" ? "โต๊ด (ทุกเลข)" : bet.numbers[0]}
            </span>
          );
        }
        if (bet.betType === "rood") {
          const choice = bet.numbers[0]?.toLowerCase();
          return (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {choice === "rood" ? "รูด (ทุกเลข)" : bet.numbers[0]}
            </span>
          );
        }
        // สำหรับรูปแบบปกติ
        return (
          <div className="flex flex-wrap gap-1">
            {bet.numbers.map((num, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium"
              >
                {num}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "จำนวนเงิน",
      render: (bet) => (
        <span className="font-semibold">{Number(bet.amount).toLocaleString("th-TH")} บาท</span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (bet) => getStatusBadge(bet.status),
    },
    {
      key: "payout",
      header: "รางวัล",
      render: (bet) =>
        bet.payout ? (
          <span className="font-semibold text-green-600">
            {Number(bet.payout).toLocaleString("th-TH")} บาท
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "createdAt",
      header: "วันที่แทง",
      render: (bet) => format(new Date(bet.createdAt), "dd/MM/yyyy HH:mm", { locale: th }),
    },
  ];

  if (loadingRound || loading) {
    return <Loading />;
  }

  if (!round) {
    return (
      <div className="space-y-6 animate-fade-in">
        <EmptyState
          title="ไม่พบข้อมูลรอบหวย"
          description="ไม่สามารถโหลดข้อมูลรอบหวยได้"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              รอบ {round.roundNumber}
            </h1>
            <p className="text-gray-600 mt-1">{round.lotteryType?.name}</p>
          </div>
        </div>
        {getRoundStatusBadge(round.status)}
      </div>

      {/* Round Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            ข้อมูลรอบหวย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">เวลาเปิด</p>
                <p className="font-semibold">
                  {format(new Date(round.openTime), "dd/MM/yyyy HH:mm", { locale: th })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">เวลาปิด</p>
                <p className="font-semibold">
                  {format(new Date(round.closeTime), "dd/MM/yyyy HH:mm", { locale: th })}
                </p>
              </div>
            </div>
            {round.result && (
              <>
                {round.result.lastTwoDigits && (
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">เลขท้าย 2 ตัว</p>
                      <p className="font-semibold text-lg text-purple-600">
                        {round.result.lastTwoDigits}
                      </p>
                    </div>
                  </div>
                )}
                {round.result.lastThreeDigits && (
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">เลขท้าย 3 ตัว</p>
                      <p className="font-semibold text-lg text-purple-600">
                        {round.result.lastThreeDigits}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">จำนวนการแทง</p>
                <p className="text-2xl font-bold">{stats.totalBets}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดแทงรวม</p>
                <p className="text-2xl font-bold">
                  {stats.totalAmount.toLocaleString("th-TH")} บาท
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">จำนวนผู้ชนะ</p>
                <p className="text-2xl font-bold text-green-600">{stats.wonBets}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดจ่ายรางวัล</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalPayout.toLocaleString("th-TH")} บาท
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bets Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการการแทง</CardTitle>
          <CardDescription>
            รายการการแทงทั้งหมดในรอบนี้ ({pagination.total} รายการ)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <EmptyState
              title="ยังไม่มีการแทง"
              description="ยังไม่มีผู้ใช้แทงในรอบนี้"
            />
          ) : (
            <>
              <DataTable columns={columns} data={betsForTable} />
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
