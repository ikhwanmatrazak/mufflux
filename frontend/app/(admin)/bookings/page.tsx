"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip, Spinner, Select, SelectItem } from "@heroui/react";
import { Calendar } from "lucide-react";
import { installationApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, any> = { pending: "warning", confirmed: "primary", completed: "success", cancelled: "danger" };

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => { installationApi.list().then((r) => setBookings(r.data)).finally(() => setLoading(false)); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await installationApi.update(id, status);
      setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
      toast.success("Booking updated");
    } catch { toast.error("Failed to update"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={24} className="text-primary" />
        <div>
          <h1 className="text-2xl font-black text-foreground">Installation Bookings</h1>
          <p className="text-foreground/40 text-sm">{bookings.length} total bookings</p>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Bookings" className="bg-content1">
          <TableHeader>
            <TableColumn className="bg-content2 text-foreground/60">ID</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">USER</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">DATE</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">TIME</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">LOCATION</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">STATUS</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">ORDER</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">UPDATE</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-foreground/30 py-8">No bookings yet</p>}>
            {bookings.map((b) => (
              <TableRow key={b.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-foreground font-mono">#{b.id}</TableCell>
                <TableCell className="text-foreground/70">User #{b.user_id}</TableCell>
                <TableCell className="text-foreground">{b.preferred_date}</TableCell>
                <TableCell className="text-foreground/70">{b.preferred_time}</TableCell>
                <TableCell className="text-foreground/50 text-sm">{b.workshop_location || "—"}</TableCell>
                <TableCell><Chip size="sm" color={STATUS_COLORS[b.status]} variant="flat" className="capitalize">{b.status}</Chip></TableCell>
                <TableCell className="text-foreground/40 text-sm">{b.order_id ? `#${b.order_id}` : "—"}</TableCell>
                <TableCell>
                  <Select size="sm" className="w-32" selectedKeys={[b.status]}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    isDisabled={updating === b.id}>
                    {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                      <SelectItem key={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
