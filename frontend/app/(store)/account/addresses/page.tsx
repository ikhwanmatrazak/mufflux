"use client";
import { useEffect, useState } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usersApi } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const EMPTY = { label: "Home", address_line1: "", address_line2: "", city: "", state: "", postcode: "", is_default: false };

export default function AddressesPage() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    usersApi.getAddresses().then((r) => setAddresses(r.data));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); onOpen(); };
  const openEdit = (addr: any) => { setEditing(addr); setForm({ ...addr }); onOpen(); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) {
        const { data } = await usersApi.updateAddress(editing.id, form);
        setAddresses((a) => a.map((x) => (x.id === editing.id ? data : x)));
      } else {
        const { data } = await usersApi.addAddress(form);
        setAddresses((a) => [...a, data]);
      }
      toast.success("Address saved!");
      onClose();
    } catch { toast.error(t("errors.generic")); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    await usersApi.deleteAddress(id);
    setAddresses((a) => a.filter((x) => x.id !== id));
    toast.success("Address deleted");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground">{t("account.myAddresses")}</h1>
        <Button color="primary" size="sm" startContent={<Plus size={14} />} onPress={openAdd}>{t("account.addAddress")}</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={48} className="text-white/10 mx-auto mb-3" />
          <p className="text-foreground/40">{t("account.noAddresses")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-content1 border border-divider rounded-2xl p-5 flex gap-4">
              <MapPin size={20} className="text-primary mt-1 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-foreground font-semibold">{addr.label}</p>
                  {addr.is_default && <Chip size="sm" color="primary" variant="flat">{t("account.default")}</Chip>}
                </div>
                <p className="text-foreground/60 text-sm">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="text-foreground/60 text-sm">{addr.city}, {addr.state} {addr.postcode}</p>
              </div>
              <div className="flex gap-2">
                <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-primary" onPress={() => openEdit(addr)}><Edit2 size={14} /></Button>
                <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => handleDelete(addr.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} className="bg-content2 border border-divider">
        <ModalContent>
          <ModalHeader className="text-foreground">{editing ? t("account.editAddress") : t("account.addAddress")}</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="Label (e.g. Home, Office)" variant="bordered" value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} />
            <Input label="Address Line 1" variant="bordered" value={form.address_line1} onChange={(e) => setForm(f => ({ ...f, address_line1: e.target.value }))} />
            <Input label="Address Line 2 (optional)" variant="bordered" value={form.address_line2 || ""} onChange={(e) => setForm(f => ({ ...f, address_line2: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" variant="bordered" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
              <Input label="State" variant="bordered" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} />
              <Input label="Postcode" variant="bordered" value={form.postcode} onChange={(e) => setForm(f => ({ ...f, postcode: e.target.value }))} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" isLoading={loading} onPress={handleSave}>{t("account.saveChanges")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
