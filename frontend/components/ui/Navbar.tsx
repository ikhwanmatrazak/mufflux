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
      {/* Logo */}
      <NavbarBrand>
        <Link href="/" className="flex items-center">
          <Image
            src="/mufflux.jpeg"
            alt="Mufflux"
            width={150}
            height={50}
            className="object-contain h-10 md:h-10 w-auto"
          />
        </Link>
      </NavbarBrand>

      {/* Desktop nav links */}
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

      {/* Right side actions */}
      <NavbarContent justify="end" className="gap-1">
        {/* Language Switcher — desktop only */}
        <NavbarItem className="hidden md:flex">
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

        {/* Wishlist — desktop only */}
        <NavbarItem className="hidden md:flex">
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

        {/* User — desktop only */}
        <NavbarItem className="hidden md:flex">
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

        {/* Mobile hamburger */}
        <NavbarItem className="md:hidden">
          <NavbarMenuToggle className="text-white" />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile slide-down menu */}
      <NavbarMenu className="bg-[#0A0A0A]/98 pt-6 gap-4">
        {[
          { href: "/", label: t("nav.home") },
          { href: "/products", label: t("nav.products") },
          { href: "/installation", label: t("nav.installation") },
          { href: "/blog", label: t("nav.blog") },
        ].map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link href={item.href} className="text-white text-lg font-semibold w-full block py-2 border-b border-[#222]">
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          {user ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/account" className="text-white text-lg font-semibold py-2 border-b border-[#222] block">
                {t("nav.account")}
              </Link>
              <button onClick={handleLogout} className="text-left text-red-400 text-lg font-semibold py-2">
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link href="/login" className="block mt-2">
              <Button color="primary" className="w-full font-semibold">
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </NavbarMenuItem>
        {/* Language switcher in mobile menu */}
        <NavbarMenuItem>
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleLanguage("en")} className={`text-sm font-medium ${language === "en" ? "text-primary" : "text-white/60"}`}>
              🇬🇧 English
            </button>
            <button onClick={() => handleLanguage("bm")} className={`text-sm font-medium ${language === "bm" ? "text-primary" : "text-white/60"}`}>
              🇲🇾 BM
            </button>
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
