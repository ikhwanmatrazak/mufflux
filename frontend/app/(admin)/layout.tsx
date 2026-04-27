"use client";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Users, BookOpen, Calendar, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@heroui/react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products-admin", icon: Package, label: "Products" },
  { href: "/orders-admin", icon: ShoppingBag, label: "Orders" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/blog-admin", icon: BookOpen, label: "Blog" },
  { href: "/bookings", icon: Calendar, label: "Bookings" },
  { href: "/settings-admin", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || user.role !== "admin") router.push("/login");
  }, [user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-content1 border-r border-divider flex flex-col shrink-0">
        <div className="p-6 border-b border-divider">
          <Link href="/">
            <span className="font-black text-xl text-foreground tracking-wider">MUFFLUX</span>
          </Link>
          <p className="text-foreground/30 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
                  ${active ? "bg-primary/20 text-primary" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"}`}>
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-divider">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold truncate">{user.name}</p>
              <p className="text-foreground/30 text-xs">Administrator</p>
            </div>
          </div>
          <Button variant="light" size="sm" className="w-full text-foreground/40 hover:text-danger" startContent={<LogOut size={14} />}
            onPress={() => { logout(); router.push("/"); }}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
