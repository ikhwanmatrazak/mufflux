"use client";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem,
  Button, Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { ShoppingCart, Heart, User, Globe, LogOut, Settings, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import i18n from "@/lib/i18n";

export default function SiteNavbar() {
  const { t } = useTranslation();
  const cartCount = useCartStore((s) => s.itemCount());
  const { user, logout } = useUserStore();
  const { language, setLanguage } = useUIStore();
  const router = useRouter();

  const handleLanguage = (lang: "en" | "bm") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Navbar
      isBordered
      className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#D400A8]/20 sticky top-0 z-50"
      maxWidth="xl"
    >
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-black text-xl">M</span>
          </div>
          <span className="font-black text-xl tracking-wider text-white hidden sm:block">
            MUFFLUX
          </span>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden md:flex gap-6" justify="center">
        <NavbarItem>
          <Link href="/" className="text-white/80 hover:text-primary transition-colors font-medium">
            {t("nav.home")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/products" className="text-white/80 hover:text-primary transition-colors font-medium">
            {t("nav.products")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/installation" className="text-white/80 hover:text-primary transition-colors font-medium">
            {t("nav.installation")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/blog" className="text-white/80 hover:text-primary transition-colors font-medium">
            {t("nav.blog")}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        {/* Language Switcher */}
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" size="sm" className="text-white/70">
                <Globe size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="bg-[#1a1a1a] border border-[#333]">
              <DropdownItem key="en" onPress={() => handleLanguage("en")} className={language === "en" ? "text-primary" : ""}>
                🇬🇧 English
              </DropdownItem>
              <DropdownItem key="bm" onPress={() => handleLanguage("bm")} className={language === "bm" ? "text-primary" : ""}>
                🇲🇾 Bahasa Malaysia
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* Wishlist */}
        <NavbarItem className="hidden sm:flex">
          <Link href="/account/wishlist">
            <Button isIconOnly variant="light" size="sm" className="text-white/70 hover:text-primary">
              <Heart size={18} />
            </Button>
          </Link>
        </NavbarItem>

        {/* Cart */}
        <NavbarItem>
          <Link href="/cart">
            <Badge content={cartCount > 0 ? cartCount : undefined} color="primary" size="sm">
              <Button isIconOnly variant="light" size="sm" className="text-white/70 hover:text-primary">
                <ShoppingCart size={18} />
              </Button>
            </Badge>
          </Link>
        </NavbarItem>

        {/* User */}
        <NavbarItem>
          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  name={user.name.charAt(0)}
                  size="sm"
                  className="cursor-pointer bg-primary/20 text-primary"
                />
              </DropdownTrigger>
              <DropdownMenu className="bg-[#1a1a1a] border border-[#333]">
                <DropdownItem key="account" startContent={<User size={14} />}>
                  <Link href="/account">{t("nav.account")}</Link>
                </DropdownItem>
                <DropdownItem key="orders" startContent={<Package size={14} />}>
                  <Link href="/account/orders">{t("account.myOrders")}</Link>
                </DropdownItem>
                {user.role === "admin" ? (
                  <DropdownItem key="admin" startContent={<Settings size={14} />} className="text-primary">
                    <Link href="/dashboard">{t("nav.admin")}</Link>
                  </DropdownItem>
                ) : null}
                <DropdownItem key="logout" startContent={<LogOut size={14} />} className="text-danger" onPress={handleLogout}>
                  {t("nav.logout")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button size="sm" color="primary" variant="flat" className="font-semibold">
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </NavbarItem>

        <NavbarMenuToggle className="md:hidden text-white" />
      </NavbarContent>

      <NavbarMenu className="bg-[#0A0A0A]/98 pt-6 gap-4">
        {[
          { href: "/", label: t("nav.home") },
          { href: "/products", label: t("nav.products") },
          { href: "/installation", label: t("nav.installation") },
          { href: "/blog", label: t("nav.blog") },
          { href: "/account", label: t("nav.account") },
        ].map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link href={item.href} className="text-white text-lg font-semibold w-full block py-2 border-b border-[#222]">
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
