"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { useReports } from "@/hooks/use-reports";

export default function ReportsPage() {
  const { reportData, loading, refetch } = useReports();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return <Loading />;
  }

  const stats = [
    {
      title: "ยอดแทงรวม",
      value: reportData.totalBets,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-l-blue-500",
      description: "ยอดแทงทั้งหมดในระบบ",
    },
    {
      title: "ยอดถูก",
      value: reportData.totalWins,
      icon: TrendingDown,
      color: "from-green-500 to-emerald-500",
      borderColor: "border-l-green-500",
      description: "ยอดจ่ายรางวัลทั้งหมด",
    },
    {
      title: "กำไรสุทธิ",
      value: reportData.profit,
      icon: DollarSign,
      color: reportData.profit >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500",
      borderColor: reportData.profit >= 0 ? "border-l-green-500" : "border-l-red-500",
      description: "กำไร-ขาดทุนสุทธิ",
      isProfit: true,
    },
    {
      title: "จำนวนผู้ใช้",
      value: reportData.totalUsers,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-l-purple-500",
      description: "ผู้ใช้ทั้งหมดในระบบ",
    },
    {
      title: "รอบที่เปิดอยู่",
      value: reportData.activeRounds,
      icon: Calendar,
      color: "from-orange-500 to-red-500",
      borderColor: "border-l-orange-500",
      description: "รอบหวยที่กำลังเปิดรับแทง",
    },
    {
      title: "ยอดเติมเงิน",
      value: reportData.totalDeposits,
      icon: ArrowDownCircle,
      color: "from-indigo-500 to-blue-500",
      borderColor: "border-l-indigo-500",
      description: "ยอดเติมเงินทั้งหมด",
    },
    {
      title: "ยอดถอนเงิน",
      value: reportData.totalWithdraws,
      icon: ArrowUpCircle,
      color: "from-teal-500 to-cyan-500",
      borderColor: "border-l-teal-500",
      description: "ยอดถอนเงินทั้งหมด",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">รายงานสรุป</h1>
        <p className="text-slate-600">ภาพรวมการทำงานของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isMoney = stat.title.includes("ยอด") || stat.title.includes("กำไร");
          return (
            <Card
              key={stat.title}
              className={`${stat.borderColor} border-l-4 hover:shadow-lg transition-all duration-200`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    stat.isProfit
                      ? reportData.profit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-slate-900"
                  }`}
                >
                  {isMoney
                    ? `฿${stat.value.toLocaleString()}`
                    : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
