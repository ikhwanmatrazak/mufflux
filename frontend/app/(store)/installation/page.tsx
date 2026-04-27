"use client";
import { useState } from "react";
import { Button, Input, Textarea, Card, CardBody } from "@heroui/react";
import { Wrench, Calendar, Clock, MapPin, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { installationApi } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import Link from "next/link";

export default function InstallationPage() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [form, setForm] = useState({ preferred_date: "", preferred_time: "", workshop_location: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error(t("errors.unauthorized")); return; }
    if (!form.preferred_date || !form.preferred_time) { toast.error("Please select date and time"); return; }
    setLoading(true);
    try {
      await installationApi.create(form);
      setSuccess(true);
      toast.success(t("installation.success"));
    } catch { toast.error(t("errors.generic")); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wrench size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl font-black text-foreground">{t("installation.title")}</h1>
        <p className="text-foreground/50 mt-2 text-lg">{t("installation.subtitle")}</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Wrench, title: "Expert Technicians", desc: "Certified professionals only" },
          { icon: Calendar, title: "Flexible Scheduling", desc: "Book your preferred slot" },
          { icon: MapPin, title: "Multiple Locations", desc: "Workshops across Malaysia" },
        ].map((f) => (
          <Card key={f.title} className="bg-content1 border border-divider">
            <CardBody className="flex flex-col items-center text-center gap-2 py-6">
              <f.icon size={28} className="text-primary" />
              <p className="text-foreground font-semibold">{f.title}</p>
              <p className="text-foreground/40 text-sm">{f.desc}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Booking Form */}
      {success ? (
        <Card className="bg-content1 border border-success/30">
          <CardBody className="flex flex-col items-center gap-4 py-12">
            <CheckCircle size={60} className="text-success" />
            <h2 className="text-2xl font-black text-foreground">{t("installation.success")}</h2>
            <p className="text-foreground/50">We'll contact you within 24 hours to confirm your booking.</p>
            <Link href="/products"><Button color="primary" className="mt-2">Continue Shopping</Button></Link>
          </CardBody>
        </Card>
      ) : (
        <Card className="bg-content1 border border-divider">
          <CardBody className="p-8 space-y-5">
            <h2 className="text-xl font-bold text-foreground">{t("installation.bookNow")}</h2>

            {!user && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                <p className="text-primary text-sm">Please <Link href="/login" className="underline font-bold">log in</Link> to book an installation.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-foreground/60 text-sm mb-2 flex items-center gap-2"><Calendar size={14} />{t("installation.selectDate")}</label>
                <Input type="date" variant="bordered" value={form.preferred_date}
                  onChange={(e) => setForm(f => ({ ...f, preferred_date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="text-foreground/60 text-sm mb-2 flex items-center gap-2"><Clock size={14} />{t("installation.selectTime")}</label>
                <Input type="time" variant="bordered" value={form.preferred_time}
                  onChange={(e) => setForm(f => ({ ...f, preferred_time: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-foreground/60 text-sm mb-2 flex items-center gap-2"><MapPin size={14} />{t("installation.location")}</label>
              <Input variant="bordered" placeholder="e.g. Shah Alam Workshop" value={form.workshop_location}
                onChange={(e) => setForm(f => ({ ...f, workshop_location: e.target.value }))} />
            </div>

            <div>
              <label className="text-foreground/60 text-sm mb-2">{t("installation.notes")}</label>
              <Textarea variant="bordered" placeholder="Any additional notes..." value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>

            <Button color="primary" size="lg" className="w-full font-bold" isLoading={loading}
              isDisabled={!user} onPress={handleSubmit}>
              {t("installation.submit")}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
