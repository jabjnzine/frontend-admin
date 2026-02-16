"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Calendar,
  Award,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { title: "จัดการผู้ใช้", href: "/users", icon: Users },
  { title: "ประเภทหวย", href: "/lottery-types", icon: Ticket },
  { title: "รอบหวย", href: "/lottery-rounds", icon: Calendar },
  { title: "กรอกผลรางวัล", href: "/results", icon: Award },
  { title: "จัดการการแทง", href: "/bets", icon: Target },
  { title: "การเงิน", href: "/transactions", icon: Wallet },
  { title: "รายงาน", href: "/reports", icon: BarChart3 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // รอให้ Zustand persist hydrate เสร็จก่อน
    if (typeof window !== 'undefined') {
      // ใช้ setTimeout เพื่อให้แน่ใจว่า Zustand hydrate เสร็จแล้ว
      const timer = setTimeout(() => {
        setCheckingAuth(false);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth && mounted) {
      // ไม่ redirect ถ้าอยู่ที่ login page แล้ว
      if (pathname !== "/login" && (!isAuthenticated || user?.role !== "admin")) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, router, pathname, checkingAuth, mounted]);

  const handleLogout = async () => {
    // Revoke refresh token on backend
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh-token') : null;
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Failed to revoke refresh token:', error);
      }
    }
    logout();
    router.push("/login");
  };

  // ถ้าอยู่ที่ login page ให้ render children โดยตรง
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // ถ้ายังไม่ mounted หรือกำลัง check auth ให้แสดง loading
  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ authenticated และไม่ใช่ login page ให้ return null (จะ redirect)
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 w-screen max-w-none">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 glass-effect border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ระบบจัดการหวย
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 hidden sm:inline">
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 min-w-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 text-lg">Admin Panel</h1>
                  <p className="text-xs text-slate-500">ระบบจัดการหวย</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">เมนูหลัก</div>
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "active bg-slate-50 text-indigo-600 border-r-3 border-r-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </a>
                );
              })}
              
              <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">การจัดการ</div>
              {navItems.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "active bg-slate-50 text-indigo-600 border-r-3 border-r-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
                  <p className="text-xs text-slate-500">ผู้ดูแลระบบ</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full">
          {/* Desktop Header */}
          <header className="glass-effect sticky top-0 z-10 border-b border-slate-200 px-3 md:px-4 lg:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 truncate">
                  {navItems.find((item) => item.href === pathname)?.title ||
                    "แดชบอร์ด"}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1 hidden sm:block">ภาพรวมระบบทั้งหมด</p>
              </div>
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <BarChart3 className="h-5 w-5" />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-3 md:p-4 lg:p-6 w-full max-w-none overflow-x-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
