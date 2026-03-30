"use client";
import { useState } from "react";
import {
  Button, Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { ShoppingCart, Heart, User, Globe, LogOut, Settings, Package, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import i18n from "@/lib/i18n";

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  };

  const close = () => setOpen(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/installation", label: t("nav.installation") },
    { href: "/blog", label: t("nav.blog") },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1a0020] via-[#0A0A0A] to-[#1a0020] border-b border-[#D400A8]/30 backdrop-blur-md">
        <div className="relative flex items-center justify-center h-16 px-4 max-w-screen-xl mx-auto">

          {/* Logo — centered on mobile, left on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mr-auto"
          >
            <Image
              src="/mufflux.jpeg"
              alt="Mufflux"
              width={160}
              height={54}
              className="object-contain h-14 md:h-11 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 mx-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-[#D400A8] transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
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
            <Link href="/account/wishlist">
              <Button isIconOnly variant="light" size="sm" className="text-white/70 hover:text-[#D400A8]">
                <Heart size={18} />
              </Button>
            </Link>
            <Link href="/cart">
              <Badge content={cartCount > 0 ? cartCount : undefined} color="primary" size="sm">
                <Button isIconOnly variant="light" size="sm" className="text-white/70 hover:text-[#D400A8]">
                  <ShoppingCart size={18} />
                </Button>
              </Badge>
            </Link>
            {user ? (
              <Dropdown>
                <DropdownTrigger>
                  <Avatar name={user.name.charAt(0)} size="sm" className="cursor-pointer bg-primary/20 text-primary" />
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
          </div>

          {/* Mobile — 3-line hamburger, absolute right */}
          <button
            className="md:hidden absolute right-4 flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={22} className="text-white" />
            ) : (
              <>
                <span className="block w-6 h-[2px] bg-white rounded-full" />
                <span className="block w-6 h-[2px] bg-[#D400A8] rounded-full" />
                <span className="block w-6 h-[2px] bg-white rounded-full" />
              </>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown — slides from top-right ── */}
      {open && (
        <>
          {/* backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30"
            onClick={close}
          />
          {/* panel */}
          <div className="md:hidden fixed top-16 right-0 z-40 w-64 bg-[#0f0018]/97 backdrop-blur-xl border-l border-b border-[#D400A8]/30 rounded-bl-2xl shadow-2xl shadow-[#D400A8]/10 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col py-3">
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-6 py-3 text-white/90 font-semibold text-base hover:text-[#D400A8] hover:bg-white/5 transition-colors border-b border-white/5"
                  onClick={close}
                >
                  {link.label}
                </Link>
              ))}

              {/* Cart */}
              <Link
                href="/cart"
                className="px-6 py-3 text-white/90 font-semibold text-base hover:text-[#D400A8] hover:bg-white/5 transition-colors border-b border-white/5 flex items-center gap-2"
                onClick={close}
              >
                <ShoppingCart size={16} />
                Cart
                {cartCount > 0 && (
                  <span className="bg-[#D400A8] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              <div className="px-4 pt-3 pb-1">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-2 py-2.5 text-white/80 font-medium text-sm hover:text-[#D400A8] transition-colors"
                      onClick={close}
                    >
                      {t("nav.account")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-2 py-2.5 text-red-400 font-medium text-sm hover:text-red-300 transition-colors"
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={close}>
                    <button className="w-full py-2.5 bg-[#D400A8] text-white font-semibold rounded-xl text-sm hover:bg-[#D400A8]/80 transition-colors">
                      {t("nav.login")}
                    </button>
                  </Link>
                )}
              </div>

              {/* Language */}
              <div className="flex gap-4 px-6 pt-2 pb-3 border-t border-white/10 mt-1">
                <button
                  onClick={() => handleLanguage("en")}
                  className={`text-xs font-semibold transition-colors ${language === "en" ? "text-[#D400A8]" : "text-white/40 hover:text-white/70"}`}
                >
                  🇬🇧 EN
                </button>
                <button
                  onClick={() => handleLanguage("bm")}
                  className={`text-xs font-semibold transition-colors ${language === "bm" ? "text-[#D400A8]" : "text-white/40 hover:text-white/70"}`}
                >
                  🇲🇾 BM
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
