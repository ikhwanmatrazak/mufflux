"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner, Input } from "@heroui/react";
import { Search, Star } from "lucide-react";
import { usersApi } from "@/lib/api";

export default function CustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { usersApi.list().then((r) => setUsers(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Customers</h1>
        <p className="text-white/40 text-sm">{users.length} registered users</p>
      </div>

      <div className="mb-4">
        <Input placeholder="Search customers..." startContent={<Search size={16} className="text-white/30" />}
          variant="bordered" className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Customers" className="bg-[#111]">
          <TableHeader>
            <TableColumn className="bg-[#1a1a1a] text-white/60">NAME</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">EMAIL</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">PHONE</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">LOYALTY PTS</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">ROLE</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">STATUS</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-white/60">JOINED</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-white/30 py-8">No customers found</p>}>
            {filtered.map((u) => (
              <TableRow key={u.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-white font-medium">{u.name}</TableCell>
                <TableCell className="text-white/60 text-sm">{u.email}</TableCell>
                <TableCell className="text-white/60 text-sm">{u.phone || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-secondary" fill="currentColor" />
                    <span className="text-secondary font-bold">{u.loyalty_points}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={u.role === "admin" ? "primary" : "default"} variant="flat">{u.role}</Chip>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={u.is_active ? "success" : "danger"} variant="flat">{u.is_active ? "Active" : "Disabled"}</Chip>
                </TableCell>
                <TableCell className="text-white/40 text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
