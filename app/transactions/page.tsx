"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { ArrowLeft, Check, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useTransactions, Transaction } from "@/hooks/use-transactions";

export default function TransactionsPage() {
  const { transactions, loading, pagination, refetch, approveTransaction, rejectTransaction, setPage } = useTransactions({ status: "pending" });
  const [typeFilter, setTypeFilter] = useState<string>("all");

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
        `฿${Number(transaction.amount).toLocaleString()}`,
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
            onClick={() => handleApprove(transaction.id)}
          >
            <Check className="w-4 h-4 mr-2" />
            อนุมัติ
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReject(transaction.id)}
          >
            <X className="w-4 h-4 mr-2" />
            ปฏิเสธ
          </Button>
        </div>
      ),
    },
  ];

  const handleApprove = async (transactionId: string) => {
    if (!confirm("คุณต้องการอนุมัติรายการนี้หรือไม่?")) {
      return;
    }

    try {
      await approveTransaction(transactionId);
      alert("อนุมัติสำเร็จ");
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      alert(message);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (!confirm("คุณต้องการปฏิเสธรายการนี้หรือไม่?")) {
      return;
    }

    try {
      await rejectTransaction(transactionId);
      alert("ปฏิเสธสำเร็จ");
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาด";
      alert(message);
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
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-64 h-12"
            >
              <option value="all">ทุกประเภท</option>
              <option value="deposit">เติมเงิน</option>
              <option value="withdraw">ถอนเงิน</option>
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
    </div>
  );
}
