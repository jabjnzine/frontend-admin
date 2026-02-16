"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Ticket,
  Calendar,
  Award,
  Wallet,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, loading, refetch } = useDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const quickActions = [
    {
      title: "จัดการผู้ใช้",
      description: "ดูและจัดการผู้ใช้ทั้งหมด",
      href: "/users",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      stat: stats.totalUsers,
    },
    {
      title: "จัดการประเภทหวย",
      description: "จัดการประเภทหวยต่างๆ",
      href: "/lottery-types",
      icon: Ticket,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "จัดการรอบหวย",
      description: "สร้างและจัดการรอบหวย",
      href: "/lottery-rounds",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      stat: stats.activeRounds,
    },
    {
      title: "กรอกผลรางวัล",
      description: "กรอกผลรางวัลสำหรับรอบหวย",
      href: "/results",
      icon: Award,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "จัดการการเงิน",
      description: "อนุมัติเติมเงิน/ถอนเงิน",
      href: "/transactions",
      icon: Wallet,
      color: "from-indigo-500 to-purple-500",
      badge: stats.pendingTransactions > 0 ? stats.pendingTransactions : undefined,
    },
    {
      title: "รายงานสรุป",
      description: "ดูรายงานสรุปยอดแทงและกำไร",
      href: "/reports",
      icon: BarChart3,
      color: "from-teal-500 to-blue-500",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-4 md:p-6 lg:p-8 text-white mb-6 md:mb-8 relative overflow-hidden animate-fade-in shadow-xl w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">สวัสดี, {user?.username} 👋</h3>
            <p className="text-indigo-100 text-base md:text-lg">ยินดีต้อนรับสู่ระบบจัดการหวยออนไลน์</p>
            <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm backdrop-blur-sm whitespace-nowrap">
                {new Date().toLocaleDateString("th-TH", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm backdrop-blur-sm whitespace-nowrap">สถานะ: ออนไลน์</span>
            </div>
          </div>
          <div className="flex gap-3 md:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 text-center min-w-[80px] md:min-w-[100px]">
              <div className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-indigo-200 mt-1">ผู้ใช้ทั้งหมด</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 text-center min-w-[80px] md:min-w-[100px]">
              <div className="text-2xl md:text-3xl font-bold">{stats.activeRounds}</div>
              <div className="text-xs text-indigo-200 mt-1">รอบที่เปิด</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in w-full">
        <div className="bg-white rounded-xl p-6 border border-slate-100 card-hover shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">ยอดเทิร์นโอเวอร์</p>
              <h4 className="text-3xl font-bold text-slate-800">฿{stats.totalBets.toLocaleString()}</h4>
              <p className="text-xs text-slate-400 mt-2">ยอดเดิมพันทั้งหมด</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600">
            <span>0% จากเดือนที่แล้ว</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 card-hover shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">รอบที่เปิดอยู่</p>
              <h4 className="text-3xl font-bold text-emerald-600">{stats.activeRounds}</h4>
              <p className="text-xs text-slate-400 mt-2">รอบหวยที่กำลังเปิดรับแทง</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span>อัปเดตล่าสุด: เพิ่งอัปเดต</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 card-hover shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">รออนุมัติ</p>
              <h4 className="text-3xl font-bold text-orange-500">{stats.pendingTransactions}</h4>
              <p className="text-xs text-slate-400 mt-2">รายการรออนุมัติ</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-orange-600 cursor-pointer hover:underline">
            <span onClick={() => router.push("/transactions")}>ดูรายละเอียด →</span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="animate-fade-in">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-indigo-600" />
          เมนูหลัก
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.href}
                className="group bg-white rounded-xl p-6 border border-slate-100 card-hover cursor-pointer shadow-sm"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  {action.stat !== undefined ? (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {action.stat} รายการ
                    </span>
                  ) : action.badge ? (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                      {action.badge}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      จัดการได้เลย
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">{action.title}</h4>
                <p className="text-sm text-slate-500 mb-4">{action.description}</p>
                <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>ไปที่หน้า</span>
                  <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
