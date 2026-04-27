"use client";
import { useState } from "react";
import { Button, Input, Card, CardBody, Divider } from "@heroui/react";
import { Settings, Phone, Store } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [whatsapp, setWhatsapp] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "");
  const [storeName, setStoreName] = useState("Mufflux Exhaust System");
  const [storeEmail, setStoreEmail] = useState("info@mufflux.com");

  const handleSave = () => {
    toast.success("Settings saved (update .env to persist)");
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} className="text-primary" />
        <h1 className="text-2xl font-black text-foreground">Store Settings</h1>
      </div>

      <div className="space-y-6">
        <Card className="bg-content1 border border-divider">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Store size={16} className="text-primary" />
              <h2 className="text-foreground font-bold">Store Information</h2>
            </div>
            <Input label="Store Name" variant="bordered" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <Input label="Contact Email" type="email" variant="bordered" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
          </CardBody>
        </Card>

        <Card className="bg-content1 border border-divider">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-success" />
              <h2 className="text-foreground font-bold">WhatsApp</h2>
            </div>
            <Input label="WhatsApp Number (with country code)" variant="bordered" placeholder="601XXXXXXXXX"
              value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <p className="text-foreground/30 text-xs">Used for the floating WhatsApp button. E.g. 60123456789</p>
          </CardBody>
        </Card>

        <Button color="primary" size="lg" className="font-bold" onPress={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
