"use client";
import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { Badge } from "@heroui/react";
import { useCartStore } from "@/store/cartStore";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const cartCount = useCartStore((s) => s.itemCount());
  const pathname = usePathname();

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/products", icon: ShoppingBag, label: "Products" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-4 py-1">
            {item.badge ? (
              <Badge content={item.badge} color="primary" size="sm">
                <Icon size={22} className={active ? "text-primary" : "text-white/50"} />
              </Badge>
            ) : (
              <Icon size={22} className={active ? "text-primary" : "text-white/50"} />
            )}
            <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-white/40"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
