"use client";
import { useState } from "react";
import { Button, Input, Textarea, Divider, Switch } from "@heroui/react";
import {
  Settings, Store, Phone, Mail, MapPin, Globe, Instagram,
  Facebook, Youtube, Search, Truck, Save, MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

function SectionHeader({ icon: Icon, label, color = "text-primary" }: { icon: any; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-1">
      <Icon size={15} className={color} />
      <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const [store, setStore] = useState({
    name: "Mufflux Exhaust System",
    tagline: "PERFORMANCE. MEROKET.",
    email: "info@mufflux.com",
    phone: "+60 12-345 6789",
    address: "Kuala Lumpur, Malaysia",
    currency: "MYR",
  });

  const [whatsapp, setWhatsapp] = useState({
    number: "60123456789",
    message: "Hi! I'm interested in your exhaust products.",
    enabled: true,
  });

  const [social, setSocial] = useState({
    instagram: "https://instagram.com/mufflux",
    facebook: "https://facebook.com/mufflux",
    youtube: "",
    tiktok: "",
    website: "https://mufflux.com",
  });

  const [seo, setSeo] = useState({
    title: "Mufflux — Malaysian Performance Exhaust Brand",
    description: "Premium motorcycle exhaust systems. PERFORMANCE. MEROKET. Est. 2024.",
  });

  const [shipping, setShipping] = useState({
    freeThreshold: "200",
    flatRate: "10",
    enabled: true,
  });

  const setS = (key: string) => (e: any) => setStore((s) => ({ ...s, [key]: e.target.value }));
  const setW = (key: string) => (e: any) => setWhatsapp((w) => ({ ...w, [key]: e.target.value }));
  const setSoc = (key: string) => (e: any) => setSocial((s) => ({ ...s, [key]: e.target.value }));
  const setSEO = (key: string) => (e: any) => setSeo((s) => ({ ...s, [key]: e.target.value }));
  const setSh = (key: string) => (e: any) => setShipping((s) => ({ ...s, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="p-8 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Store Settings</h1>
          <p className="text-foreground/40 text-sm mt-0.5">Configure your store details and preferences</p>
        </div>
        <Button
          color="primary" isLoading={saving} onPress={handleSave}
          startContent={<Save size={15} />} className="font-bold"
        >
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">

        {/* ── Store Information ── */}
        <section className="bg-content1 border border-divider rounded-2xl p-6 space-y-5">
          <SectionHeader icon={Store} label="Store Information" />
          <Divider className="opacity-30" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Store Name" variant="bordered"
              value={store.name} onChange={setS("name")}
              placeholder="e.g. Mufflux Exhaust System"
            />
            <Input
              label="Tagline" variant="bordered"
              value={store.tagline} onChange={setS("tagline")}
              placeholder="e.g. PERFORMANCE. MEROKET."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email" type="email" variant="bordered"
              value={store.email} onChange={setS("email")}
              startContent={<Mail size={14} className="text-foreground/40" />}
            />
            <Input
              label="Phone" variant="bordered"
              value={store.phone} onChange={setS("phone")}
              startContent={<Phone size={14} className="text-foreground/40" />}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address / Location" variant="bordered"
              value={store.address} onChange={setS("address")}
              startContent={<MapPin size={14} className="text-foreground/40" />}
            />
            <Input
              label="Currency Code" variant="bordered"
              value={store.currency} onChange={setS("currency")}
              placeholder="MYR"
              description="ISO 4217 currency code"
            />
          </div>
        </section>

        {/* ── WhatsApp ── */}
        <section className="bg-content1 border border-divider rounded-2xl p-6 space-y-5">
          <SectionHeader icon={MessageSquare} label="WhatsApp" color="text-success" />
          <Divider className="opacity-30" />

          <div className="flex items-center justify-between bg-content2 rounded-xl px-4 py-3 border border-divider">
            <div>
              <p className="text-foreground text-sm font-semibold">Enable WhatsApp Button</p>
              <p className="text-foreground/40 text-xs">Show floating WhatsApp button on the store</p>
            </div>
            <Switch
              isSelected={whatsapp.enabled}
              onValueChange={(v) => setWhatsapp((w) => ({ ...w, enabled: v }))}
              color="success"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="WhatsApp Number" variant="bordered"
              value={whatsapp.number} onChange={setW("number")}
              placeholder="601XXXXXXXXX"
              description="Include country code, no + or spaces"
              startContent={<span className="text-foreground/40 text-xs font-mono">+</span>}
            />
            <Input
              label="Default Message" variant="bordered"
              value={whatsapp.message} onChange={setW("message")}
              placeholder="Hi! I'm interested in your products."
              description="Pre-filled message when customers tap the button"
            />
          </div>
        </section>

        {/* ── Social Media ── */}
        <section className="bg-content1 border border-divider rounded-2xl p-6 space-y-5">
          <SectionHeader icon={Globe} label="Social Media & Links" color="text-secondary" />
          <Divider className="opacity-30" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Instagram" variant="bordered"
              value={social.instagram} onChange={setSoc("instagram")}
              startContent={<Instagram size={14} className="text-foreground/40" />}
              placeholder="https://instagram.com/yourhandle"
            />
            <Input
              label="Facebook" variant="bordered"
              value={social.facebook} onChange={setSoc("facebook")}
              startContent={<Facebook size={14} className="text-foreground/40" />}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="YouTube" variant="bordered"
              value={social.youtube} onChange={setSoc("youtube")}
              startContent={<Youtube size={14} className="text-foreground/40" />}
              placeholder="https://youtube.com/@yourchannel"
            />
            <Input
              label="TikTok" variant="bordered"
              value={social.tiktok} onChange={setSoc("tiktok")}
              placeholder="https://tiktok.com/@yourhandle"
              description="Optional"
            />
          </div>
          <Input
            label="Website URL" variant="bordered"
            value={social.website} onChange={setSoc("website")}
            startContent={<Globe size={14} className="text-foreground/40" />}
            placeholder="https://mufflux.com"
          />
        </section>

        {/* ── SEO / Meta ── */}
        <section className="bg-content1 border border-divider rounded-2xl p-6 space-y-5">
          <SectionHeader icon={Search} label="SEO & Meta" color="text-warning" />
          <Divider className="opacity-30" />
          <Input
            label="Site Title" variant="bordered"
            value={seo.title} onChange={setSEO("title")}
            description="Shown in browser tabs and Google search results"
          />
          <Textarea
            label="Meta Description" variant="bordered"
            value={seo.description} onChange={setSEO("description")}
            minRows={2}
            description={`${seo.description.length}/160 characters — keep under 160 for best SEO`}
          />
        </section>

        {/* ── Shipping ── */}
        <section className="bg-content1 border border-divider rounded-2xl p-6 space-y-5">
          <SectionHeader icon={Truck} label="Shipping" color="text-primary" />
          <Divider className="opacity-30" />

          <div className="flex items-center justify-between bg-content2 rounded-xl px-4 py-3 border border-divider">
            <div>
              <p className="text-foreground text-sm font-semibold">Enable Shipping</p>
              <p className="text-foreground/40 text-xs">Calculate and show shipping rates at checkout</p>
            </div>
            <Switch
              isSelected={shipping.enabled}
              onValueChange={(v) => setShipping((s) => ({ ...s, enabled: v }))}
              color="primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Flat Rate (MYR)" variant="bordered" type="number"
              value={shipping.flatRate} onChange={setSh("flatRate")}
              startContent={<span className="text-foreground/50 text-sm font-bold">RM</span>}
              description="Default shipping fee per order"
            />
            <Input
              label="Free Shipping Threshold (MYR)" variant="bordered" type="number"
              value={shipping.freeThreshold} onChange={setSh("freeThreshold")}
              startContent={<span className="text-foreground/50 text-sm font-bold">RM</span>}
              description="Orders above this amount get free shipping"
            />
          </div>
        </section>

        {/* Bottom save */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-foreground/30 text-xs">
            Some settings require a server restart to take effect.
          </p>
          <Button
            color="primary" isLoading={saving} onPress={handleSave}
            startContent={<Save size={15} />} className="font-bold px-8"
          >
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
}
