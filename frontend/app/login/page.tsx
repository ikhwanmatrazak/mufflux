"use client";
import { useState } from "react";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { authApi } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useUserStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error(t("errors.required")); return; }
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setUser(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(data.user.role === "admin" ? "/dashboard" : "/");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-black text-3xl tracking-wider text-white">MUFFLUX</span>
          </Link>
          <p className="text-white/40 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-[#111] border border-[#222]">
          <CardBody className="p-8 space-y-4">
            <Input
              label={t("account.email")} type="email" variant="bordered"
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Input
              label="Password" type={showPwd ? "text" : "password"} variant="bordered"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              endContent={
                <button onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button color="primary" size="lg" className="w-full font-bold" isLoading={loading} onPress={handleLogin}>
              {t("nav.login")}
            </Button>

            <p className="text-center text-white/40 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">Register</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
