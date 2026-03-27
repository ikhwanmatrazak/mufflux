"use client";
import { useEffect, useState } from "react";
import { Chip, Spinner, Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { ordersApi } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS: Record<string, any> = {
  pending: "default", paid: "secondary", processing: "primary",
  shipped: "warning", delivered: "success", cancelled: "danger",
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    ordersApi.list().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner color="primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-white mb-6">{t("account.myOrders")}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 mb-4">{t("account.noOrders")}</p>
          <Link href="/products"><Button color="primary">Shop Now</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#111] border border-[#222] rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white font-bold">Order #{order.id}</p>
                  <Chip size="sm" color={STATUS_COLORS[order.status] || "default"} variant="flat">
                    {t(`account.orderStatus.${order.status}`)}
                  </Chip>
                </div>
                <p className="text-white/40 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-primary font-bold mt-1">RM{Number(order.total_amount).toFixed(2)}</p>
              </div>
              <Link href={`/account/orders/${order.id}`}>
                <Button size="sm" variant="bordered" className="border-[#333] text-white/60">{t("account.viewDetail")}</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
