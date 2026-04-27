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

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useUserStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { toast.error(t("errors.required")); return; }
    if (form.password.length < 8) { toast.error(t("errors.passwordShort")); return; }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setUser(data.user, data.access_token);
      toast.success(`Welcome to Mufflux, ${data.user.name}!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("errors.generic"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="font-black text-3xl tracking-wider text-white">MUFFLUX</span></Link>
          <p className="text-foreground/40 mt-2">Create your account</p>
        </div>

        <Card className="bg-[#111] border border-[#222]">
          <CardBody className="p-8 space-y-4">
            <Input label={t("account.name")} variant="bordered" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label={t("account.email")} type="email" variant="bordered" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label={t("account.phone")} variant="bordered" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input
              label="Password" type={showPwd ? "text" : "password"} variant="bordered"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              endContent={
                <button onClick={() => setShowPwd(!showPwd)} className="text-foreground/40 hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button color="primary" size="lg" className="w-full font-bold" isLoading={loading} onPress={handleRegister}>
              Create Account
            </Button>
            <p className="text-center text-foreground/40 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">{t("nav.login")}</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
