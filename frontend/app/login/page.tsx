"use client";
import { useState } from "react";
import { Button } from "@heroui/react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Image from "next/image";
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
  const [focused, setFocused] = useState<string | null>(null);

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D400A8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#7B00FF]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <Image src="/mufflux.png" alt="Mufflux" width={200} height={66} className="object-contain mx-auto" priority />
          </Link>
          <p className="text-foreground/40 mt-3 text-sm font-medium tracking-wide">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-content1/80 backdrop-blur-sm border border-[#D400A8]/20 rounded-2xl p-8 shadow-2xl shadow-[#D400A8]/5">
          <div className="space-y-5">

            {/* Email field */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 tracking-wide transition-colors ${focused === "email" || form.email ? "text-[#D400A8]" : "text-foreground/50"}`}>
                Email
              </label>
              <div className={`flex items-center gap-3 bg-content2 rounded-xl px-4 py-3 border transition-all duration-200 ${
                focused === "email" ? "border-[#D400A8] shadow-[0_0_0_3px_rgba(212,0,168,0.1)]" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
              }`}>
                <Mail size={16} className={`shrink-0 transition-colors ${focused === "email" || form.email ? "text-[#D400A8]" : "text-foreground/30"}`} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder-white/20 font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 tracking-wide transition-colors ${focused === "password" || form.password ? "text-[#D400A8]" : "text-foreground/50"}`}>
                Password
              </label>
              <div className={`flex items-center gap-3 bg-content2 rounded-xl px-4 py-3 border transition-all duration-200 ${
                focused === "password" ? "border-[#D400A8] shadow-[0_0_0_3px_rgba(212,0,168,0.1)]" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
              }`}>
                <Lock size={16} className={`shrink-0 transition-colors ${focused === "password" || form.password ? "text-[#D400A8]" : "text-foreground/30"}`} />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder-white/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-foreground/30 hover:text-[#D400A8] transition-colors shrink-0"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <Button
              color="primary"
              size="lg"
              className="w-full font-bold text-base mt-2 h-12 rounded-xl"
              isLoading={loading}
              onPress={handleLogin}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-divider" />
            <span className="text-foreground/20 text-xs">or</span>
            <div className="flex-1 h-px bg-divider" />
          </div>

          <p className="text-center text-foreground/40 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#D400A8] hover:text-[#ff00cc] font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>

        {/* Back to store */}
        <p className="text-center mt-6">
          <Link href="/" className="text-white/25 hover:text-foreground/50 text-xs transition-colors">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
