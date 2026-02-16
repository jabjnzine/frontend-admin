"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserX, Search, AlertTriangle, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUsers, User } from "@/hooks/use-users";

export default function UsersPage() {
  const { users, loading, pagination, refetch, deactivateUser, setPage } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Filter users locally (หรือสามารถส่งไปที่ backend ได้)
  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Define columns
  const columns: Column<User>[] = [
    {
      key: "username",
      header: "ชื่อผู้ใช้",
      sortKey: "username",
      render: (user) => <span className="font-medium">{user.username}</span>,
    },
    {
      key: "role",
      header: "บทบาท",
      sortKey: "role",
      render: (user) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-purple-50 text-purple-700"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}
        </span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (user) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {user.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "วันที่สมัคร",
      sortKey: "createdAt",
      render: (user) =>
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("th-TH")
          : "-",
    },
    {
      key: "actions",
      header: "การจัดการ",
      headerClassName: "text-right",
      className: "text-right",
      render: (user) => (
        <div 
          className="flex items-center justify-end pointer-events-auto relative z-10" 
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors pointer-events-auto"
                title="การดำเนินการ"
                type="button"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === "active" ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onSelect={() => {
                    setSelectedUserId(user.id);
                    setSelectedUsername(user.username);
                    setOpenDialog(true);
                  }}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  ปิดใช้งาน
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400">
                  ปิดใช้งานแล้ว
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleDeactivate = async () => {
    if (!selectedUserId) return;

    try {
      setIsDeactivating(true);
      await deactivateUser(selectedUserId);
      setOpenDialog(false);
      setSelectedUserId(null);
      setSelectedUsername("");
    } catch (error: any) {
      console.error("Failed to deactivate user:", error);
      // Error จะถูกจัดการใน hook แล้ว
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
          จัดการผู้ใช้
        </h1>
        <p className="text-slate-600">ดูและจัดการผู้ใช้ในระบบ</p>
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
            data={filteredUsers}
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
                  ? "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา"
                  : "ยังไม่มีผู้ใช้ในระบบ",
            }}
          />
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-left">
                  ยืนยันการปิดใช้งานผู้ใช้
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left mt-1">
                  คุณต้องการปิดใช้งานผู้ใช้ <span className="font-semibold text-slate-900">{selectedUsername}</span> หรือไม่?
                  <br />
                  <span className="text-xs text-slate-400 mt-1 block">
                    ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง
                  </span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeactivating ? "กำลังดำเนินการ..." : "ปิดใช้งาน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
