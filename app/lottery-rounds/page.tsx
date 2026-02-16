"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { FormSelect } from "@/components/form/form-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Search, X, MoreVertical, Edit, Trash2, Check, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSortHeader, useTableSort } from "@/components/ui/table-sort";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLotteryTypes } from "@/hooks/use-lottery-types";
import { useLotteryRounds, LotteryRound } from "@/hooks/use-lottery-rounds";

const roundSchema = z.object({
  lotteryTypeId: z.string().min(1, "กรุณาเลือกประเภทหวย"),
  roundNumber: z.string().min(1, "กรุณากรอกรอบ"),
  openTime: z.string().min(1, "กรุณาเลือกเวลาเปิด"),
  closeTime: z.string().min(1, "กรุณาเลือกเวลาปิด"),
  status: z.enum(["open", "closed", "completed"]).optional(),
});

export default function LotteryRoundsPage() {
  const router = useRouter();
  const { types } = useLotteryTypes();
  const { rounds, loading, pagination, refetch, createRound, updateRound, deleteRound, setPage } = useLotteryRounds();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRound, setSelectedRound] = useState<LotteryRound | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      lotteryTypeId: "",
      roundNumber: "",
      openTime: "",
      closeTime: "",
      status: "open" as const,
    },
  });


  const handleCreateClick = () => {
    setSelectedRound(null);
    form.reset({
      lotteryTypeId: "",
      roundNumber: "",
      openTime: "",
      closeTime: "",
      status: "open",
    });
    setShowFormDialog(true);
  };

  const handleEditClick = (round: LotteryRound) => {
    setSelectedRound(round);
    // Format dates for datetime-local input
    const openTime = new Date(round.openTime).toISOString().slice(0, 16);
    const closeTime = new Date(round.closeTime).toISOString().slice(0, 16);
    form.reset({
      lotteryTypeId: round.lotteryType.id,
      roundNumber: round.roundNumber,
      openTime: openTime,
      closeTime: closeTime,
      status: round.status as "open" | "closed" | "completed",
    });
    setShowFormDialog(true);
  };

  const handleDeleteClick = (round: LotteryRound) => {
    setSelectedRound(round);
    setShowDeleteDialog(true);
  };

  const onSubmit = async (data: z.infer<typeof roundSchema>) => {
    setIsSubmitting(true);
    try {
      if (selectedRound) {
        await updateRound(selectedRound.id, {
          lotteryTypeId: data.lotteryTypeId,
          roundNumber: data.roundNumber,
          openTime: data.openTime,
          closeTime: data.closeTime,
          status: data.status,
        });
        setDialogMessage("อัปเดตรอบหวยสำเร็จ");
      } else {
        await createRound({
          lotteryTypeId: data.lotteryTypeId,
          roundNumber: data.roundNumber,
          openTime: data.openTime,
          closeTime: data.closeTime,
        });
        setDialogMessage("สร้างรอบหวยสำเร็จ");
      }
      setSuccessDialogOpen(true);
      form.reset();
      setShowFormDialog(false);
      setSelectedRound(null);
      await refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      setDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRound) return;

    setIsSubmitting(true);
    try {
      await deleteRound(selectedRound.id);
      setDialogMessage("ลบรอบหวยสำเร็จ");
      setSuccessDialogOpen(true);
      setShowDeleteDialog(false);
      setSelectedRound(null);
      await refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      setDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
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
      render: (round) => (
        <button
          onClick={() => router.push(`/lottery-rounds/${round.id}`)}
          className="text-left font-medium text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
        >
          {round.roundNumber}
        </button>
      ),
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
    {
      key: "actions",
      header: "การจัดการ",
      headerClassName: "text-right",
      className: "text-right",
      render: (round) => (
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
                onSelect={() => router.push(`/lottery-rounds/${round.id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                ดูรายละเอียด
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => handleEditClick(round)}
              >
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onSelect={() => handleDeleteClick(round)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <Button 
          onClick={handleCreateClick}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          สร้างรอบใหม่
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRound ? "แก้ไขรอบหวย" : "สร้างรอบหวยใหม่"}
            </DialogTitle>
            <DialogDescription>
              {selectedRound
                ? "แก้ไขข้อมูลรอบหวย"
                : "กรอกข้อมูลเพื่อสร้างรอบหวยใหม่"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="lotteryTypeId"
                  label="ประเภทหวย"
                  placeholder="เลือกประเภทหวย"
                  options={types.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                />
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
                {selectedRound && (
                  <FormSelect
                    control={form.control}
                    name="status"
                    label="สถานะ"
                    placeholder="เลือกสถานะ"
                    options={[
                      { value: "open", label: "เปิดรับแทง" },
                      { value: "closed", label: "ปิดรับแทง" },
                      { value: "completed", label: "เสร็จสิ้น" },
                    ]}
                  />
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFormDialog(false);
                    form.reset();
                    setSelectedRound(null);
                  }}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                >
                  {isSubmitting
                    ? "กำลังบันทึก..."
                    : selectedRound
                    ? "บันทึกการแก้ไข"
                    : "สร้าง"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>ยืนยันการลบรอบหวย</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  คุณต้องการลบรอบหวย{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedRound?.lotteryType.name} - รอบ {selectedRound?.roundNumber}
                  </span>{" "}
                  หรือไม่?
                  <br />
                  <span className="text-xs text-red-600 mt-1 block">
                    ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้
                    {selectedRound?.status === "open" && (
                      <span className="block mt-1">
                        ⚠️ รอบนี้ยังเปิดรับแทงอยู่ ไม่ควรลบ
                      </span>
                    )}
                  </span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "กำลังลบ..." : "ลบ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-48 h-10 text-sm">
                  <SelectValue placeholder="ทุกประเภทหวย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภทหวย</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-48 h-10 text-sm">
                  <SelectValue placeholder="ทุกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="open">เปิดรับแทง</SelectItem>
                  <SelectItem value="closed">ปิดรับแทง</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                </SelectContent>
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

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              สำเร็จ
            </DialogTitle>
            <DialogDescription className="mt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setSuccessDialogOpen(false)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {dialogMessage}
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
