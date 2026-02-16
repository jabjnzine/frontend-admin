"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Search, Trash2, Check, X, MoreVertical } from "lucide-react";
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
import { useLotteryTypesPaginated, LotteryType } from "@/hooks/use-lottery-types-paginated";

const payoutRateField = z
  .union([z.number(), z.string()])
  .transform((v) =>
    v === '' || v === undefined ? undefined : typeof v === 'string' ? (isNaN(Number(v)) ? undefined : Number(v)) : v
  )
  .refine((v) => v === undefined || (typeof v === 'number' && v >= 1), { message: 'อัตราจ่ายต้องไม่ต่ำกว่า 1' })
  .optional();

const payoutRatesSchema = z.object({
  two_digit: payoutRateField,
  three_digit: payoutRateField,
  running: payoutRateField,
  set: payoutRateField,
  high_low: payoutRateField,
  todd: payoutRateField,
  odd_even: payoutRateField,
  rood: payoutRateField,
}).optional();

const lotteryTypeSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อประเภทหวย"),
  code: z.string().min(1, "กรุณากรอกรหัส"),
  status: z.enum(["active", "inactive"]).default("active"),
  payoutRates: payoutRatesSchema,
});

export default function LotteryTypesPage() {
  const { types, loading, pagination, refetch, setPage, createType, updateType, deleteType } = useLotteryTypesPaginated();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<LotteryType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(lotteryTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      status: "active" as const,
      payoutRates: {
        two_digit: undefined,
        three_digit: undefined,
        running: undefined,
        set: undefined,
        high_low: undefined,
        todd: undefined,
        odd_even: undefined,
        rood: undefined,
      },
    },
  });

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleCreateClick = () => {
    setSelectedType(null);
    form.reset({
      name: "",
      code: "",
      status: "active",
      payoutRates: {
        two_digit: undefined,
        three_digit: undefined,
        running: undefined,
        set: undefined,
        high_low: undefined,
        todd: undefined,
        odd_even: undefined,
        rood: undefined,
      },
    });
    setShowFormDialog(true);
  };

  const handleEditClick = (type: LotteryType) => {
    setSelectedType(type);
    form.reset({
      name: type.name,
      code: type.code,
      status: type.status as "active" | "inactive",
      payoutRates: type.payoutRates || {
        two_digit: undefined,
        three_digit: undefined,
        running: undefined,
        set: undefined,
        high_low: undefined,
        todd: undefined,
        odd_even: undefined,
        rood: undefined,
      },
    });
    setShowFormDialog(true);
  };

  const handleDeleteClick = (type: LotteryType) => {
    setSelectedType(type);
    setShowDeleteDialog(true);
  };

  const onSubmit = async (data: z.infer<typeof lotteryTypeSchema>) => {
    setIsSubmitting(true);
    try {
      // ทำความสะอาด payoutRates: ลบ undefined values และแปลง string เป็น number
      const cleanedPayoutRates = data.payoutRates
        ? Object.entries(data.payoutRates).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && typeof value === 'number' && !isNaN(value) && value > 0) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, number>)
        : undefined;

      const submitData = {
        ...data,
        payoutRates: Object.keys(cleanedPayoutRates || {}).length > 0 ? cleanedPayoutRates : undefined,
      };

      if (selectedType) {
        await updateType(selectedType.id, submitData);
        setDialogMessage("อัปเดตประเภทหวยสำเร็จ");
      } else {
        await createType(submitData);
        setDialogMessage("สร้างประเภทหวยสำเร็จ");
      }
      setSuccessDialogOpen(true);
      setShowFormDialog(false);
      form.reset();
      setSelectedType(null);
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
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await deleteType(selectedType.id);
      setDialogMessage("ลบประเภทหวยสำเร็จ");
      setSuccessDialogOpen(true);
      setShowDeleteDialog(false);
      setSelectedType(null);
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

  const filteredTypes = Array.isArray(types) ? types.filter((type) => {
    const matchesSearch = 
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || type.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Define columns
  const columns: Column<LotteryType>[] = [
    {
      key: "name",
      header: "ชื่อประเภทหวย",
      sortKey: "name",
      render: (type) => <span className="font-medium">{type.name}</span>,
    },
    {
      key: "code",
      header: "รหัส",
      sortKey: "code",
      render: (type) => (
        <code className="px-2.5 py-1 bg-slate-50 rounded text-sm font-medium text-slate-600">
          {type.code}
        </code>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      sortKey: "status",
      render: (type) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            type.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {type.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "payoutRates",
      header: "อัตราจ่าย",
      render: (type) => {
        if (!type.payoutRates) {
          return <span className="text-gray-400 text-sm">ใช้ค่า default</span>;
        }
        const rates = type.payoutRates;
        const ratesList = [];
        if (rates.two_digit) ratesList.push(`2ตัว: ${rates.two_digit}x`);
        if (rates.three_digit) ratesList.push(`3ตัว: ${rates.three_digit}x`);
        if (rates.running) ratesList.push(`วิ่ง: ${rates.running}x`);
        if (rates.set) ratesList.push(`ชุด: ${rates.set}x`);
        if (rates.high_low) ratesList.push(`บนล่าง: ${rates.high_low}x`);
        if (rates.todd) ratesList.push(`โต๊ด: ${rates.todd}x`);
        if (rates.odd_even) ratesList.push(`คู่/คี่: ${rates.odd_even}x`);
        if (rates.rood) ratesList.push(`รูด: ${rates.rood}x`);
        
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {ratesList.length > 0 ? (
              <>
                {ratesList.slice(0, 3).map((rate, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                  >
                    {rate}
                  </span>
                ))}
                {ratesList.length > 3 && (
                  <span className="text-gray-500 text-xs self-center">+{ratesList.length - 3}</span>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">ใช้ค่า default</span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "วันที่สร้าง",
      sortKey: "createdAt",
      render: (type) => type.createdAt ? new Date(type.createdAt).toLocaleDateString("th-TH") : "-",
    },
    {
      key: "actions",
      header: "การจัดการ",
      headerClassName: "text-right",
      className: "text-right",
      render: (type) => (
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
                onSelect={() => handleEditClick(type)}
              >
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onSelect={() => handleDeleteClick(type)}
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
            จัดการประเภทหวย
          </h1>
          <p className="text-slate-600">จัดการประเภทหวยต่างๆ ในระบบ</p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มประเภทหวย
        </Button>
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
              data={filteredTypes}
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
                    ? "ไม่พบประเภทหวยที่ตรงกับเงื่อนไขการค้นหา"
                    : "ยังไม่มีประเภทหวยในระบบ",
              }}
            />
          </CardContent>
        </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedType ? "แก้ไขประเภทหวย" : "เพิ่มประเภทหวย"}
            </DialogTitle>
            <DialogDescription>
              {selectedType
                ? "แก้ไขข้อมูลประเภทหวยและอัตราจ่ายรางวัล"
                : "กรอกข้อมูลเพื่อเพิ่มประเภทหวยใหม่"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name="name"
                label="ชื่อประเภทหวย"
                placeholder="เช่น หวยรัฐบาล"
              />
              <FormInput
                control={form.control}
                name="code"
                label="รหัส"
                placeholder="เช่น gov"
              />
              <FormSelect
                control={form.control}
                name="status"
                label="สถานะ"
                placeholder="เลือกสถานะ"
                options={[
                  { value: "active", label: "เปิดใช้งาน" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ]}
              />
              
              {/* อัตราจ่ายรางวัล */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900">อัตราจ่ายรางวัล (เท่า)</h3>
                <p className="text-xs text-gray-500 mb-3">
                  กำหนดอัตราจ่ายรางวัลสำหรับแต่ละรูปแบบการแทง (เว้นว่างไว้จะใช้ค่า default)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    control={form.control}
                    name="payoutRates.two_digit"
                    label="2 ตัว"
                    type="number"
                    placeholder="90"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.three_digit"
                    label="3 ตัว"
                    type="number"
                    placeholder="900"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.running"
                    label="วิ่ง"
                    type="number"
                    placeholder="3"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.set"
                    label="ชุด"
                    type="number"
                    placeholder="3"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.high_low"
                    label="บนล่าง"
                    type="number"
                    placeholder="2"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.todd"
                    label="โต๊ด"
                    type="number"
                    placeholder="3"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.odd_even"
                    label="คู่/คี่"
                    type="number"
                    placeholder="2"
                  />
                  <FormInput
                    control={form.control}
                    name="payoutRates.rood"
                    label="รูด"
                    type="number"
                    placeholder="3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFormDialog(false);
                    form.reset();
                    setSelectedType(null);
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
                    : selectedType
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
                <AlertDialogTitle>ยืนยันการลบประเภทหวย</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  คุณต้องการลบประเภทหวย{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedType?.name}
                  </span>{" "}
                  หรือไม่?
                  <br />
                  <span className="text-xs text-red-600 mt-1 block">
                    ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้
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
