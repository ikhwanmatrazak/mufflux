"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Input
} from "@heroui/react";
import { adminApi, ordersApi } from "@/lib/api";
import { Download, FileText } from "lucide-react";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    adminApi.listOrders({ limit: 200 })
      .then((r) => setOrders(r.data))
      .catch(() => ordersApi.list({ limit: 100 }).then((r) => setOrders(r.data)))
      .finally(() => setLoading(false));
  }, []);

  const openUpdate = (order: any) => {
    setSelected(order);
    setNewStatus(order.status);
    setTracking(order.tracking_number || "");
    onOpen();
  };

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

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await adminApi.downloadReport({ start_date: startDate || undefined, end_date: endDate || undefined });
      toast.success("Report downloaded");
    } catch { toast.error("Failed to download report"); }
    finally { setDownloading(false); }
  };

  const openInvoice = (orderId: number) => {
    window.open(`/invoice/${orderId}`, "_blank");
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Orders</h1>
          <p className="text-foreground/40 text-sm">{orders.length} total orders</p>
        </div>

        {/* Download Report */}
        <div className="flex flex-wrap items-end gap-2 bg-content1 border border-divider rounded-xl p-3">
          <div>
            <p className="text-foreground/40 text-xs mb-1">From</p>
            <Input
              type="date"
              size="sm"
              variant="bordered"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              classNames={{ input: "text-foreground text-sm", inputWrapper: "border-divider bg-content2" }}
            />
          </div>
          <div>
            <p className="text-foreground/40 text-xs mb-1">To</p>
            <Input
              type="date"
              size="sm"
              variant="bordered"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              classNames={{ input: "text-foreground text-sm", inputWrapper: "border-divider bg-content2" }}
            />
          </div>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            isLoading={downloading}
            startContent={<Download size={14} />}
            onPress={handleDownloadReport}
          >
            Download Report
          </Button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Orders" className="bg-content1">
          <TableHeader>
            <TableColumn className="bg-content2 text-foreground/60">ORDER ID</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">DATE</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">CUSTOMER</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">TOTAL</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">STATUS</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">TRACKING</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-foreground/30 py-8">No orders yet</p>}>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-foreground font-mono font-bold">#{order.id}</TableCell>
                <TableCell className="text-foreground/50 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-foreground/70">
                  {order.user ? order.user.name : `User #${order.user_id}`}
                </TableCell>
                <TableCell className="text-primary font-bold">
                  RM{Number(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={STATUS_COLORS[order.status]} variant="flat" className="capitalize">
                    {order.status}
                  </Chip>
                </TableCell>
                <TableCell className="text-foreground/40 text-xs font-mono">
                  {order.tracking_number || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="bordered" className="border-divider text-foreground/60" onPress={() => openUpdate(order)}>
                      Update
                    </Button>
                    {["paid", "processing", "shipped", "delivered"].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        startContent={<FileText size={12} />}
                        onPress={() => openInvoice(order.id)}
                      >
                        Invoice
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} className="bg-content2 border border-divider">
        <ModalContent>
          <ModalHeader className="text-foreground">Update Order #{selected?.id}</ModalHeader>
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
