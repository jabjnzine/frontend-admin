"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactions, Transaction } from "@/hooks/use-transactions";

export default function TransactionsPage() {
  const { transactions, loading, pagination, refetch, approveTransaction, rejectTransaction, setPage } = useTransactions({ status: "pending" });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((t) => {
    return typeFilter === "all" || t.type === typeFilter;
  }) : [];

  // Define columns
  const columns: Column<Transaction>[] = [
    {
      key: "wallet",
      header: "ผู้ใช้",
      sortKey: "wallet.userId",
      render: (transaction) => transaction.wallet?.userId || "-",
    },
    {
      key: "type",
      header: "ประเภท",
      sortKey: "type",
      render: (transaction) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            transaction.type === "deposit"
              ? "bg-blue-100 text-blue-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {transaction.type === "deposit" ? "เติมเงิน" : "ถอนเงิน"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "จำนวนเงิน",
      sortKey: "amount",
      render: (transaction) =>
        `฿${Number(transaction.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      key: "description",
      header: "รายละเอียด",
      render: (transaction) => transaction.description || "-",
    },
    {
      key: "createdAt",
      header: "วันที่",
      sortKey: "createdAt",
      render: (transaction) =>
        new Date(transaction.createdAt).toLocaleString("th-TH"),
    },
    {
      key: "actions",
      header: "การจัดการ",
      headerClassName: "text-right",
      className: "text-right",
      render: (transaction) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => handleApproveClick(transaction)}
            className="cursor-pointer bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            อนุมัติ
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleRejectClick(transaction)}
            className="cursor-pointer"
          >
            <X className="w-4 h-4 mr-2" />
            ปฏิเสธ
          </Button>
        </div>
      ),
    },
  ];

  const handleApproveClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedTransaction) return;

    setIsProcessing(true);
    try {
      await approveTransaction(selectedTransaction.id);
      setSuccessMessage("อนุมัติรายการสำเร็จ");
      setSuccessDialogOpen(true);
      setApproveDialogOpen(false);
      await refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      setSuccessMessage(message);
      setSuccessDialogOpen(true);
    } finally {
      setIsProcessing(false);
      setSelectedTransaction(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedTransaction) return;

    setIsProcessing(true);
    try {
      await rejectTransaction(selectedTransaction.id);
      setSuccessMessage("ปฏิเสธรายการสำเร็จ");
      setSuccessDialogOpen(true);
      setRejectDialogOpen(false);
      await refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      setSuccessMessage(message);
      setSuccessDialogOpen(true);
    } finally {
      setIsProcessing(false);
      setSelectedTransaction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
          จัดการการเงิน
        </h1>
        <p className="text-slate-600">อนุมัติรายการเติมเงิน/ถอนเงิน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">รายการรออนุมัติ</CardTitle>
          <CardDescription>
            รายการเติมเงิน/ถอนเงินที่รอการอนุมัติ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-6">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-64 h-11 text-sm">
                <SelectValue placeholder="ทุกประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="deposit">เติมเงิน</SelectItem>
                <SelectItem value="withdraw">ถอนเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filteredTransactions}
            loading={loading}
            pagination={
              pagination.totalPages > 1 && typeFilter === "all"
                ? {
                    currentPage: pagination.page,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.total,
                    itemsPerPage: pagination.limit,
                    onPageChange: handlePageChange,
                  }
                : undefined
            }
            emptyState={{
              title: "ไม่พบรายการ",
              description:
                typeFilter !== "all"
                  ? "ไม่พบรายการที่ตรงกับประเภทที่เลือก"
                  : "ไม่มีรายการรออนุมัติ",
            }}
          />
        </CardContent>
        </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <AlertDialogTitle>ยืนยันการอนุมัติรายการ</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  คุณต้องการอนุมัติรายการ{" "}
                  {selectedTransaction?.type === "deposit" ? "เติมเงิน" : "ถอนเงิน"}{" "}
                  จำนวน{" "}
                  <span className="font-semibold text-slate-900">
                    ฿{selectedTransaction?.amount.toLocaleString()}
                  </span>{" "}
                  หรือไม่?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isProcessing}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {isProcessing ? "กำลังดำเนินการ..." : "อนุมัติ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>ยืนยันการปฏิเสธรายการ</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  คุณต้องการปฏิเสธรายการ{" "}
                  {selectedTransaction?.type === "deposit" ? "เติมเงิน" : "ถอนเงิน"}{" "}
                  จำนวน{" "}
                  <span className="font-semibold text-slate-900">
                    ฿{selectedTransaction?.amount.toLocaleString()}
                  </span>{" "}
                  หรือไม่?
                  <br />
                  <span className="text-xs text-red-600 mt-1 block">
                    ⚠️ รายการนี้จะถูกปฏิเสธและไม่สามารถย้อนกลับได้
                  </span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? "กำลังดำเนินการ..." : "ปฏิเสธ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success / Error Message Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {successMessage.includes("สำเร็จ") ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  สำเร็จ
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  เกิดข้อผิดพลาด
                </>
              )}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setSuccessDialogOpen(false)}
              className={successMessage.includes("สำเร็จ") ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
