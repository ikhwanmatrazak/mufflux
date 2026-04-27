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
    { href: "/products", icon: ShoppingBag, label: "Shop" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-content1/95 backdrop-blur-md border-t border-divider">
      <div className="flex items-center justify-around px-2 py-2 pb-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-1 min-w-0">
              <div className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all ${active ? "bg-primary/15" : ""}`}>
                {item.badge ? (
                  <Badge content={item.badge} color="primary" size="sm" className="min-w-4 h-4 text-[10px]">
                    <Icon size={20} className={active ? "text-primary" : "text-foreground/50"} />
                  </Badge>
                ) : (
                  <Icon size={20} className={active ? "text-primary" : "text-foreground/50"} />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? "text-primary" : "text-foreground/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
