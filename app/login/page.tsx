"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import { Ticket, Lock, User, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", data);
      const { access_token, refresh_token, user } = response.data.data || response.data;

      if (user.role !== "admin") {
        setError("คุณไม่มีสิทธิ์เข้าถึงระบบ Admin");
        return;
      }

      login(user, access_token, refresh_token || '');
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/30 mb-6 animate-scale-in">
            <Ticket className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            ระบบจัดการหวยออนไลน์
          </h1>
          <p className="text-slate-600 font-medium">เข้าสู่ระบบผู้ดูแล</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              เข้าสู่ระบบ
            </CardTitle>
            <CardDescription className="text-center">
              กรุณาเข้าสู่ระบบเพื่อเข้าถึงระบบจัดการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <FormInput
                    control={form.control}
                    name="username"
                    label="ชื่อผู้ใช้"
                    placeholder="กรอกชื่อผู้ใช้"
                    icon={<User className="h-4 w-4" />}
                  />
                  <FormInput
                    control={form.control}
                    name="password"
                    type="password"
                    label="รหัสผ่าน"
                    placeholder="กรอกรหัสผ่าน"
                    icon={<Lock className="h-4 w-4" />}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          © {new Date().getFullYear()} ระบบจัดการหวยออนไลน์. สงวนลิขสิทธิ์.
        </p>
      </div>
    </div>
  );
}
