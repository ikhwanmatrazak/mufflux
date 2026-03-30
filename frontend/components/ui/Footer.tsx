"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { Divider } from "@heroui/react";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#060606] border-t border-[#D400A8]/20 mt-20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Image src="/mufflux.jpeg" alt="Mufflux" width={110} height={36} className="object-contain" />
            <p className="text-white/50 text-sm leading-relaxed">
              Malaysian Performance Exhaust Brand. PERFORMANCE. MEROKET. Est. 2024.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-white/40 hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-white/40 hover:text-secondary transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/products", label: t("nav.products") },
                { href: "/blog", label: t("nav.blog") },
                { href: "/installation", label: t("nav.installation") },
                { href: "/account", label: t("nav.account") },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-primary transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Phone size={14} className="text-primary shrink-0" />
                <span>011-70099733</span>
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Mail size={14} className="text-primary shrink-0" />
                <span>info@mufflux.com</span>
              </li>
              <li className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span>KL, Selangor, Negeri Sembilan</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-white/50 hover:text-primary transition-colors text-sm">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/50 hover:text-primary transition-colors text-sm">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Divider className="my-8 bg-[#D400A8]/20" />

        <div className="text-center text-white/30 text-xs">
          {t("footer.rights", { year })}
        </div>
      </div>
    </footer>
  );
}
