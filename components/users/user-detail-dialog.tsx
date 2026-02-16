"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bet, Transaction } from "@/hooks/use-users";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, History, Ticket, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailDialog({
  open,
  onOpenChange,
  userId,
}: UserDetailDialogProps) {
  const { getUser, getUserBets, getUserTransactions } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (open && userId) {
      loadUserData();
    } else {
      // Reset when dialog closes
      setUser(null);
      setBets([]);
      setTransactions([]);
      setActiveTab("info");
    }
  }, [open, userId]);

  const loadUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [userData, betsData, transactionsData] = await Promise.all([
        getUser(userId),
        getUserBets(userId),
        getUserTransactions(userId),
      ]);
      
      setUser(userData);
      setBets(betsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-100 text-green-700";
      case "lost":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getBetStatusLabel = (status: string) => {
    switch (status) {
      case "won":
        return "ชนะ";
      case "lost":
        return "แพ้";
      case "pending":
        return "รอผล";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-700";
      case "withdraw":
        return "bg-red-100 text-red-700";
      case "bet":
        return "bg-blue-100 text-blue-700";
      case "win":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "เติมเงิน";
      case "withdraw":
        return "ถอนเงิน";
      case "bet":
        return "แทงหวย";
      case "win":
        return "ชนะรางวัล";
      default:
        return type;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getTransactionStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "อนุมัติ";
      case "completed":
        return "เสร็จสิ้น";
      case "pending":
        return "รออนุมัติ";
      case "rejected":
        return "ปฏิเสธ";
      default:
        return status;
    }
  };

  if (!user && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            รายละเอียดผู้ใช้
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">ข้อมูลผู้ใช้</TabsTrigger>
              <TabsTrigger value="bets">ประวัติการแทง</TabsTrigger>
              <TabsTrigger value="transactions">ประวัติธุรกรรม</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      ข้อมูลพื้นฐาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">ชื่อผู้ใช้</p>
                      <p className="font-semibold">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">บทบาท</p>
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">สถานะ</p>
                      <Badge
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {user.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">ยอดเงินคงเหลือ</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(user.wallet?.balance || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      สถิติ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.stats && (
                      <>
                        <div>
                          <p className="text-sm text-slate-500">จำนวนครั้งที่แทง</p>
                          <p className="text-lg font-semibold">{user.stats.totalBets} ครั้ง</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">ยอดแทงรวม</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatCurrency(user.stats.totalBetAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">จำนวนธุรกรรม</p>
                          <p className="text-lg font-semibold">{user.stats.totalTransactions} รายการ</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">ยอดเติมเงินรวม</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(user.stats.totalDeposits)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">ยอดถอนเงินรวม</p>
                          <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(user.stats.totalWithdraws)}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bets" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    ประวัติการแทง ({bets.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      ไม่มีประวัติการแทง
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>รอบหวย</TableHead>
                            <TableHead>ประเภท</TableHead>
                            <TableHead>เลขที่แทง</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">รางวัล</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bets.map((bet) => (
                            <TableRow key={bet.id}>
                              <TableCell className="text-sm">
                                {formatDate(bet.createdAt)}
                              </TableCell>
                              <TableCell>
                                {bet.lotteryRound?.roundNumber || "-"}
                                {bet.lotteryRound?.lotteryType && (
                                  <span className="text-xs text-slate-500 block">
                                    {bet.lotteryRound.lotteryType.name}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{bet.betType}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {bet.numbers.map((num, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {num}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(bet.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getBetStatusColor(bet.status)}>
                                  {getBetStatusLabel(bet.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {bet.payout ? (
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(bet.payout)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    ประวัติธุรกรรม ({transactions.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      ไม่มีประวัติธุรกรรม
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ประเภท</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-sm">
                                {formatDate(transaction.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getTransactionTypeColor(transaction.type)}>
                                  {getTransactionTypeLabel(transaction.type)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getTransactionStatusColor(transaction.status)}>
                                  {getTransactionStatusLabel(transaction.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {transaction.description || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
