"use client";
import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/userStore";
import { usersApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser, accessToken } = useUserStore();
  const router = useRouter();

  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", password: "" });
  const [loading, setLoading] = useState(false);

  if (!user) { router.push("/login"); return null; }

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await usersApi.updateProfile(payload);
      setUser(data, accessToken!);
      toast.success("Profile updated!");
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-white mb-8">{t("account.editProfile")}</h1>
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
        <Input label={t("account.name")} variant="bordered" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label={t("account.email")} variant="bordered" value={user.email} isReadOnly className="opacity-60" />
        <Input label={t("account.phone")} variant="bordered" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
        <Input label={t("account.newPassword")} type="password" variant="bordered" placeholder="Leave blank to keep current" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
        <Button color="primary" className="w-full font-bold" isLoading={loading} onPress={handleSave}>{t("account.saveChanges")}</Button>
      </div>
    </div>
  );
}
