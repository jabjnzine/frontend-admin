"use client";

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
import { UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  currentStatus: "active" | "inactive";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function UserStatusDialog({
  open,
  onOpenChange,
  username,
  currentStatus,
  onConfirm,
  isLoading = false,
}: UserStatusDialogProps) {
  const isActivating = currentStatus === "inactive";
  const isDeactivating = currentStatus === "active";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isDeactivating ? "bg-red-100" : "bg-green-100"
              )}
            >
              {isDeactivating ? (
                <UserX className="h-5 w-5 text-red-600" />
              ) : (
                <UserCheck className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                {isDeactivating
                  ? "ยืนยันการปิดใช้งานผู้ใช้"
                  : "ยืนยันการเปิดใช้งานผู้ใช้"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-1">
                คุณต้องการ{isDeactivating ? "ปิดใช้งาน" : "เปิดใช้งาน"}ผู้ใช้{" "}
                <span className="font-semibold text-slate-900">{username}</span>{" "}
                หรือไม่?
                {isDeactivating && (
                  <>
                    <br />
                    <span className="text-xs text-red-600 mt-1 block">
                      ⚠️ ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง
                    </span>
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "text-white",
              isDeactivating
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#8B5CF6] hover:bg-[#7C3AED]"
            )}
          >
            {isLoading
              ? "กำลังดำเนินการ..."
              : isDeactivating
              ? "ปิดใช้งาน"
              : "เปิดใช้งาน"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
