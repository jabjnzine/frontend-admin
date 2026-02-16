"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bet, Transaction, useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, History, Ticket, ArrowLeft, UserCheck, UserX, Edit } from "lucide-react";
import { format } from "date-fns";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UserStatusDialog } from "@/components/users/user-status-dialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  
  const { getUser, getUserBets, getUserTransactions, activateUser, deactivateUser, updateUser, updateWalletBalance } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState<string>("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    if (userId) {
      loadUserData();
    } else {
      setError("ไม่พบ User ID ใน URL");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) {
      setError("ไม่พบ User ID");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Load user data first
      const userData = await getUser(userId);
      setUser(userData);
      
      // Then load bets and transactions in parallel
      try {
        const [betsData, transactionsData] = await Promise.all([
          getUserBets(userId).catch((err) => {
            console.warn("Failed to load bets:", err);
            return [];
          }),
          getUserTransactions(userId).catch((err) => {
            console.warn("Failed to load transactions:", err);
            return [];
          }),
        ]);
        
        setBets(betsData);
        setTransactions(transactionsData);
      } catch (err) {
        console.warn("Failed to load some data:", err);
        // Continue even if bets/transactions fail
      }
    } catch (error: any) {
      console.error("Failed to load user data:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้";
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setIsTogglingStatus(true);
    try {
      if (user.status === "active") {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      setOpenStatusDialog(false);
      await loadUserData();
    } catch (error: any) {
      console.error("Failed to toggle user status:", error);
      setDialogMessage(error?.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้");
      setErrorDialogOpen(true);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleEditSubmit = async (data: { username?: string; password?: string; role?: string; status?: string }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        username: data.username,
        password: data.password || undefined,
        role: data.role,
        status: data.status,
      });
      setOpenEditDialog(false);
      await loadUserData();
    } catch (error: any) {
      console.error("Failed to update user:", error);
      setDialogMessage(error?.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขผู้ใช้");
      setErrorDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBalanceUpdate = async () => {
    if (!user) return;
    
    const balance = parseFloat(newBalance);
    if (isNaN(balance) || balance < 0) {
      setDialogMessage("กรุณากรอกยอดเงินที่ถูกต้อง (ต้องเป็นตัวเลขและไม่ติดลบ)");
      setWarningDialogOpen(true);
      return;
    }

    setIsUpdatingBalance(true);
    try {
      await updateWalletBalance(user.id, balance, "Admin adjusted balance");
      setOpenBalanceDialog(false);
      setNewBalance("");
      await loadUserData();
    } catch (error: any) {
      console.error("Failed to update balance:", error);
      setDialogMessage(error?.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขยอดเงิน");
      setErrorDialogOpen(true);
    } finally {
      setIsUpdatingBalance(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-slate-500 mb-2 text-lg">
            {error || "ไม่พบข้อมูลผู้ใช้"}
          </p>
          {error && (
            <p className="text-sm text-slate-400 mb-4">
              User ID: {userId}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/users")} variant="outline" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              กลับไปหน้ารายการผู้ใช้
            </Button>
            {error && (
              <Button onClick={loadUserData} variant="default">
                ลองอีกครั้ง
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TypeScript guard: user is guaranteed to be non-null here
  if (!user) {
    return null;
  }

  // Use non-null assertion since we've checked above
  const currentUser = user;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/users")}
              variant="outline"
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              กลับ
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{currentUser.username}</h1>
              <p className="text-slate-500 mt-1">รายละเอียดผู้ใช้</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setOpenEditDialog(true)}
              variant="outline"
              className="group"
            >
              <Edit className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
              แก้ไข
            </Button>
            <Button
              onClick={() => setOpenStatusDialog(true)}
              disabled={isTogglingStatus}
              variant="outline"
              className={cn(
                "group",
                currentUser.status === "active" 
                  ? "border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_8px_25px_rgba(239,68,68,0.3)]" 
                  : "border-[#8B5CF6] text-[#8B5CF6]"
              )}
            >
              {currentUser.status === "active" ? (
                <>
                  <UserX className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  ปิดใช้งาน
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  เปิดใช้งาน
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="info">ข้อมูลผู้ใช้</TabsTrigger>
            <TabsTrigger value="bets">ประวัติการแทง</TabsTrigger>
            <TabsTrigger value="transactions">ประวัติธุรกรรม</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6 space-y-6">
            {/* Statistics Cards Grid */}
            {currentUser.stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">จำนวนครั้งที่แทง</p>
                        <p className="text-2xl font-bold text-slate-900">{currentUser.stats.totalBets}</p>
                        <p className="text-xs text-slate-500 mt-1">ครั้ง</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Ticket className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">ยอดแทงรวม</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(currentUser.stats.totalBetAmount)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">บาท</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">ยอดเติมเงินรวม</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(currentUser.stats.totalDeposits)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">บาท</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">ยอดถอนเงินรวม</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(currentUser.stats.totalWithdraws)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">บาท</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <History className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    ข้อมูลพื้นฐาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">ชื่อผู้ใช้</p>
                      <p className="font-semibold text-lg">{currentUser.username}</p>
                    </div>
                    <Badge
                      className={
                        currentUser.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {currentUser.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">สถานะ</p>
                      <Badge
                        className={
                          currentUser.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {currentUser.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                  </div>

                  <div className="pb-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-500">ยอดเงินคงเหลือ</p>
                      <Button
                        onClick={() => {
                          setNewBalance((currentUser.wallet?.balance || 0).toString());
                          setOpenBalanceDialog(true);
                        }}
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs group"
                      >
                        <Edit className="h-3 w-3 mr-1 transition-transform duration-200 group-hover:scale-110" />
                        แก้ไข
                      </Button>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(currentUser.wallet?.balance || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-1">วันที่สร้าง</p>
                    <p className="text-sm font-medium">{formatDate(currentUser.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    สรุปข้อมูล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {currentUser.stats && (
                    <>
                      <div className="pb-4 border-b">
                        <p className="text-sm text-slate-500 mb-1">จำนวนธุรกรรมทั้งหมด</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {currentUser.stats.totalTransactions}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">รายการ</p>
                      </div>

                      <div className="pb-4 border-b">
                        <p className="text-sm text-slate-500 mb-1">ยอดเงินสุทธิ</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            (currentUser.wallet?.balance || 0) +
                            currentUser.stats.totalWithdraws -
                            currentUser.stats.totalDeposits
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          ยอดเงินคงเหลือ + ถอน - เติม
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 mb-2">อัตราส่วนการแทง</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">ยอดแทง / ยอดเติม</span>
                            <span className="font-semibold">
                              {currentUser.stats.totalDeposits > 0
                                ? ((currentUser.stats.totalBetAmount / currentUser.stats.totalDeposits) * 100).toFixed(1)
                                : "0"}
                              %
                            </span>
                          </div>
                          {currentUser.stats.totalBets > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">ยอดแทงเฉลี่ยต่อครั้ง</span>
                              <span className="font-semibold">
                                {formatCurrency(currentUser.stats.totalBetAmount / currentUser.stats.totalBets)}
                              </span>
                            </div>
                          )}
                        </div>
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

        {/* Edit User Dialog */}
        <UserFormDialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          onSubmit={handleEditSubmit}
          user={currentUser}
          isLoading={isSubmitting}
        />

        {/* Edit Balance Dialog */}
        <Dialog open={openBalanceDialog} onOpenChange={setOpenBalanceDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>แก้ไขยอดเงินคงเหลือ</DialogTitle>
              <DialogDescription>
                ปัจจุบัน: {formatCurrency(currentUser.wallet?.balance || 0)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="balance">ยอดเงินใหม่</Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenBalanceDialog(false);
                  setNewBalance("");
                }}
                disabled={isUpdatingBalance}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleBalanceUpdate}
                disabled={isUpdatingBalance}
                className={isUpdatingBalance ? "relative" : ""}
              >
                {isUpdatingBalance ? (
                  <>
                    <span className="opacity-0">กำลังบันทึก...</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    </span>
                  </>
                ) : (
                  "บันทึก"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Confirmation Dialog */}
        {user && (
          <UserStatusDialog
            open={openStatusDialog}
            onOpenChange={setOpenStatusDialog}
            username={currentUser.username}
            currentStatus={currentUser.status as "active" | "inactive"}
            onConfirm={handleToggleStatus}
            isLoading={isTogglingStatus}
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

        {/* Warning Dialog */}
        <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <X className="h-4 w-4 text-yellow-600" />
                </div>
                คำเตือน
              </DialogTitle>
              <DialogDescription className="mt-2">
                {dialogMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setWarningDialogOpen(false)}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              >
                ตกลง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
