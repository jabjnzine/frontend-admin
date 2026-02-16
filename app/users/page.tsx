"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserX, Search, MoreVertical, Plus, Edit, UserCheck, Wallet, TrendingUp, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { useUsers, User } from "@/hooks/use-users";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UserStatusDialog } from "@/components/users/user-status-dialog";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { users, loading, pagination, refetch, createUser, updateUser, getUser, deactivateUser, activateUser, setPage } = useUsers({
    page: currentPage,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [openUserFormDialog, setOpenUserFormDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPage(1);
    // Hook will automatically refetch when params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, roleFilter]);

  // Use users directly from API (no client-side filtering)
  const displayUsers = Array.isArray(users) ? users : [];

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
      key: "wallet",
      header: "ยอดเงินคงเหลือ",
      sortKey: "wallet.balance",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900">
            ฿{user.wallet?.balance?.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </span>
        </div>
      ),
    },
    {
      key: "stats",
      header: "สถิติ",
      render: (user) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-slate-600">
              แทง: <span className="font-semibold text-slate-900">{user.stats?.totalBets || 0}</span> ครั้ง
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">
              ยอดแทง: <span className="font-semibold text-slate-900">฿{(user.stats?.totalBetAmount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "transactions",
      header: "ธุรกรรม",
      render: (user) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-green-500" />
            <span className="text-slate-600">
              ทั้งหมด: <span className="font-semibold text-slate-900">{user.stats?.totalTransactions || 0}</span> รายการ
            </span>
          </div>
          <div className="text-slate-500">
            เติม: ฿{(user.stats?.totalDeposits || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 
            ถอน: ฿{(user.stats?.totalWithdraws || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
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
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors pointer-events-auto cursor-pointer"
                title="การดำเนินการ"
                type="button"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={async () => {
                  try {
                    const userData = await getUser(user.id);
                    setSelectedUser(userData);
                    setOpenUserFormDialog(true);
                  } catch (error) {
                    console.error("Failed to fetch user:", error);
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </DropdownMenuItem>
              {user.status === "active" ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onSelect={() => {
                    setSelectedUserId(user.id);
                    setSelectedUsername(user.username);
                    setOpenDeactivateDialog(true);
                  }}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  ปิดใช้งาน
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
                  onSelect={() => {
                    setSelectedUserId(user.id);
                    setSelectedUsername(user.username);
                    setOpenDeactivateDialog(true);
                  }}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  เปิดใช้งาน
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleStatusChange = async () => {
    if (!selectedUserId) return;

    try {
      setIsDeactivating(true);
      const selectedUserData = displayUsers.find((u) => u.id === selectedUserId);
      if (selectedUserData?.status === "active") {
        await deactivateUser(selectedUserId);
      } else {
        await activateUser(selectedUserId);
      }
      setOpenDeactivateDialog(false);
      setSelectedUserId(null);
      setSelectedUsername("");
    } catch (error: any) {
      console.error("Failed to change user status:", error);
      setErrorMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้");
      setErrorDialogOpen(true);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleUserFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Update user
        await updateUser(selectedUser.id, data);
      } else {
        // Create user
        await createUser(data);
      }
      setOpenUserFormDialog(false);
      setSelectedUser(null);
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setErrorDialogOpen(true);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            จัดการผู้ใช้
          </h1>
          <p className="text-slate-600">ดูและจัดการผู้ใช้ในระบบ</p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setOpenUserFormDialog(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          {/* Search and Filter */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อผู้ใช้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-slate-300"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
                <SelectValue placeholder="ทุกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกบทบาท</SelectItem>
                <SelectItem value="user">ผู้ใช้ (ลูกค้า)</SelectItem>
                <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="active">ใช้งาน</SelectItem>
                <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={displayUsers}
            loading={loading}
            pagination={
              pagination.totalPages > 1
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
                searchQuery || statusFilter !== "all" || roleFilter !== "all"
                  ? "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา"
                  : "ยังไม่มีผู้ใช้ในระบบ",
            }}
            onRowClick={(user) => {
              router.push(`/users/${user.id}`);
            }}
            rowClassName={() => "cursor-pointer hover:bg-slate-50 transition-colors"}
          />
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={openUserFormDialog}
        onOpenChange={setOpenUserFormDialog}
        onSubmit={handleUserFormSubmit}
        user={selectedUser}
        isLoading={isSubmitting}
      />

      {/* Status Change Dialog */}
      {selectedUserId && (
        <UserStatusDialog
          open={openDeactivateDialog}
          onOpenChange={setOpenDeactivateDialog}
          username={selectedUsername}
          currentStatus={
            (displayUsers.find((u) => u.id === selectedUserId)?.status as "active" | "inactive") || "active"
          }
          onConfirm={handleStatusChange}
          isLoading={isDeactivating}
        />
      )}

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <X className="h-4 w-4 text-red-600" />
              </div>
              เกิดข้อผิดพลาด
            </DialogTitle>
            <DialogDescription className="mt-2">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setErrorDialogOpen(false)}
              variant="destructive"
            >
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
