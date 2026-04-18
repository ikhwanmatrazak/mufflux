"use client";
import { useEffect } from "react";
import { Tabs, Tab, Progress, Chip, Card, CardBody, Button } from "@heroui/react";
import { Package, MapPin, Heart, User, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  if (!user) return null;

  const maxPoints = 1000;
  const pointsPercent = Math.min((user.loyalty_points / maxPoints) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-primary font-black text-2xl">{user.name.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-white/40">{user.email}</p>
        </div>
      </div>

      {/* Loyalty Points Card */}
      <Card className="bg-gradient-to-r from-[#D400A8]/20 to-[#F5C200]/10 border border-[#D400A8]/30 mb-8">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/60 text-sm">{t("account.loyaltyPoints")}</p>
              <p className="text-4xl font-black text-primary">{user.loyalty_points}</p>
              <p className="text-white/40 text-xs mt-1">≈ RM{(user.loyalty_points * 0.1).toFixed(2)}</p>
            </div>
            <Star size={48} className="text-secondary/30" fill="currentColor" />
          </div>
          <Progress value={pointsPercent} color="secondary" size="sm" className="mt-2" />
          <p className="text-white/30 text-xs mt-1">{user.loyalty_points}/{maxPoints} pts to next reward</p>
        </CardBody>
      </Card>

      <Tabs color="primary" className="w-full">
        <Tab key="overview" title={<span className="flex items-center gap-2"><User size={14} />{t("account.overview")}</span>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { href: "/account/orders", icon: Package, label: t("account.myOrders"), color: "text-primary" },
              { href: "/account/addresses", icon: MapPin, label: t("account.myAddresses"), color: "text-secondary" },
              { href: "/account/wishlist", icon: Heart, label: t("account.myWishlist"), color: "text-danger" },
              { href: "/account/profile", icon: User, label: t("account.profile"), color: "text-success" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="bg-[#111] border border-[#222] hover:border-[#D400A8]/40 transition-colors cursor-pointer">
                  <CardBody className="flex flex-col items-center justify-center gap-2 py-8">
                    <item.icon size={28} className={item.color} />
                    <span className="text-white text-sm font-semibold text-center">{item.label}</span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </Tab>

        <Tab key="orders" title={<span className="flex items-center gap-2"><Package size={14} />{t("account.myOrders")}</span>}>
          <OrdersTab />
        </Tab>

        <Tab key="profile" title={<span className="flex items-center gap-2"><User size={14} />{t("account.profile")}</span>}>
          <ProfileTab user={user} />
        </Tab>
      </Tabs>
    </div>
  );
}

function OrdersTab() {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <Link href="/account/orders">
        <Button color="primary" variant="flat" size="sm">{t("account.orderHistory")} →</Button>
      </Link>
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 bg-[#111] border border-[#222] rounded-2xl p-6">
      <Link href="/account/profile">
        <Button color="primary" variant="flat" size="sm">{t("account.editProfile")} →</Button>
      </Link>
    </div>
  );
}
