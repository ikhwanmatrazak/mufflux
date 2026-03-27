"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Input
} from "@heroui/react";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, any> = {
  pending: "default", paid: "secondary", processing: "primary",
  shipped: "warning", delivered: "success", cancelled: "danger",
};

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { ordersApi.list({ limit: 100 }).then((r) => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  const openUpdate = (order: any) => { setSelected(order); setNewStatus(order.status); setTracking(order.tracking_number || ""); onOpen(); };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await ordersApi.updateStatus(selected.id, { status: newStatus, tracking_number: tracking || undefined });
      setOrders(o => o.map(x => x.id === selected.id ? { ...x, status: newStatus, tracking_number: tracking } : x));
      toast.success("Order updated");
      onClose();
    } catch { toast.error("Failed to update order"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Orders</h1>
        <p className="text-white/40 text-sm">{orders.length} total orders</p>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Orders" className="bg-[#111]">
          <TableHeader>
            <TableColumn className="bg-[#1a1a1a] text-white/60">ORDER ID</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">DATE</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">CUSTOMER</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">TOTAL</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">STATUS</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">TRACKING</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-white/30 py-8">No orders yet</p>}>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-white font-mono font-bold">#{order.id}</TableCell>
                <TableCell className="text-white/50 text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-white/70">User #{order.user_id}</TableCell>
                <TableCell className="text-primary font-bold">RM{Number(order.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip size="sm" color={STATUS_COLORS[order.status]} variant="flat" className="capitalize">{order.status}</Chip>
                </TableCell>
                <TableCell className="text-white/40 text-xs font-mono">{order.tracking_number || "—"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="bordered" className="border-[#333] text-white/60" onPress={() => openUpdate(order)}>Update</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} className="bg-[#1a1a1a] border border-[#333]">
        <ModalContent>
          <ModalHeader className="text-white">Update Order #{selected?.id}</ModalHeader>
          <ModalBody className="space-y-4">
            <Select label="Status" variant="bordered" selectedKeys={[newStatus]} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => <SelectItem key={s} className="capitalize">{s}</SelectItem>)}
            </Select>
            <Input label="Tracking Number" variant="bordered" placeholder="e.g. EL123456789MY" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" isLoading={saving} onPress={handleUpdate}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
