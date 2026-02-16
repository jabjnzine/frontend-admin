"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { Button } from "@/components/ui/button";
import { User } from "@/hooks/use-users";

const userSchema = z.object({
  username: z.string().min(4, "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร"),
  password: z.string().optional(),
  role: z.enum(["user", "admin"], {
    required_error: "กรุณาเลือกบทบาท",
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "กรุณาเลือกสถานะ",
  }),
});

const createUserSchema = userSchema.extend({
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof userSchema>) => Promise<void>;
  user?: User | null;
  isLoading?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
}: UserFormDialogProps) {
  const isEdit = !!user;
  const schema = isEdit ? userSchema : createUserSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      role: "user" as const,
      status: "active" as const,
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        username: user.username,
        password: "", // Don't prefill password
        role: user.role as "user" | "admin",
        status: user.status as "active" | "inactive",
      });
    } else if (!user && open) {
      form.reset({
        username: "",
        password: "",
        role: "user" as const,
        status: "active" as const,
      });
    }
  }, [user, open, form]);

  const handleSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      // If editing and password is empty, don't send it
      const submitData: any = {
        username: data.username,
        role: data.role,
        status: data.status,
      };
      
      // Only include password if it's provided (for create) or if it's not empty (for edit)
      if (!isEdit || (isEdit && data.password && data.password.length > 0)) {
        submitData.password = data.password;
      }
      
      await onSubmit(submitData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "แก้ไขข้อมูลผู้ใช้ในระบบ"
              : "กรอกข้อมูลเพื่อเพิ่มผู้ใช้ใหม่ในระบบ"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="username"
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อผู้ใช้"
            />

            <FormInput
              control={form.control}
              name="password"
              type="password"
              label={isEdit ? "รหัสผ่าน (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"}
              placeholder={isEdit ? "เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน" : "กรอกรหัสผ่าน"}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="role"
                label="บทบาท"
                placeholder="เลือกบทบาท"
                options={[
                  { value: "user", label: "ผู้ใช้" },
                  { value: "admin", label: "ผู้ดูแลระบบ" },
                ]}
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
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
