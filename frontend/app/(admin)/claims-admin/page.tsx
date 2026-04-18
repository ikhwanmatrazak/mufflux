"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Textarea,
} from "@heroui/react";
import { claimsApi } from "@/lib/api";
import { FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, any> = {
  pending: "warning",
  reviewing: "primary",
  approved: "success",
  rejected: "danger",
};

const STATUSES = ["pending", "reviewing", "approved", "rejected"];

const TYPE_LABEL: Record<string, string> = {
  warranty: "Warranty",
  defect: "Defect",
  wrong_item: "Wrong Item",
  refund: "Refund",
  service: "Service",
  other: "Other",
};

export default function AdminClaimsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = (status?: string) => {
    setLoading(true);
    claimsApi.adminList(status === "all" ? undefined : status)
      .then((r) => setClaims(r.data))
      .catch(() => toast.error("Failed to load claims"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openClaim = (claim: any) => {
    setSelected(claim);
    setNewStatus(claim.status);
    setAdminNotes(claim.admin_notes || "");
    onOpen();
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updated = await claimsApi.adminUpdate(selected.id, {
        status: newStatus,
        admin_notes: adminNotes || undefined,
      });
      setClaims((c) => c.map((x) => x.id === selected.id ? updated.data : x));
      toast.success("Claim updated");
      onClose();
    } catch {
      toast.error("Failed to update claim");
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterStatus === "all" ? claims : claims.filter((c) => c.status === filterStatus);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Claims Management</h1>
          <p className="text-white/40 text-sm mt-1">{claims.length} total claims</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? "solid" : "flat"}
              color={s === "all" ? "default" : STATUS_COLORS[s] || "default"}
              onPress={() => setFilterStatus(s)}
              className="capitalize"
            >
              {s}
              {s !== "all" && (
                <span className="ml-1 opacity-60">
                  ({claims.filter((c) => c.status === s).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner color="primary" /></div>
      ) : (
        <Table
          aria-label="Claims table"
          classNames={{
            wrapper: "bg-white/5 border border-white/10",
            th: "bg-white/5 text-white/60 font-semibold",
            td: "text-white/80 border-b border-white/5",
          }}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>USER</TableColumn>
            <TableColumn>TITLE</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ATTACHMENTS</TableColumn>
            <TableColumn>ACTION</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No claims found">
            {filtered.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>#{claim.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{claim.user_name}</p>
                    <p className="text-white/40 text-xs">{claim.user_email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="max-w-[200px] truncate text-sm">{claim.title}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs">{TYPE_LABEL[claim.claim_type] || claim.claim_type}</span>
                </TableCell>
                <TableCell>
                  {claim.amount ? (
                    <span className="text-secondary font-semibold text-sm">RM{Number(claim.amount).toFixed(2)}</span>
                  ) : (
                    <span className="text-white/30 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-white/50">
                    {new Date(claim.created_at).toLocaleDateString("en-MY")}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={STATUS_COLORS[claim.status]} variant="flat" className="capitalize">
                    {claim.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-white/40 text-xs">
                    {claim.attachments?.length || 0} file{claim.attachments?.length !== 1 ? "s" : ""}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="flat" color="primary" startContent={<Eye size={13} />} onPress={() => openClaim(claim)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Review modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside"
        classNames={{ base: "bg-[#0f0f0f] border border-white/10", header: "border-b border-white/10", footer: "border-t border-white/10" }}>
        <ModalContent>
          {selected && (
            <>
              <ModalHeader className="text-white font-bold">Claim #{selected.id} — {selected.title}</ModalHeader>
              <ModalBody className="py-4 space-y-4">
                {/* User info */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white/40 text-xs">User</p>
                    <p className="text-white font-medium text-sm">{selected.user_name}</p>
                    <p className="text-white/50 text-xs">{selected.user_email}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Submitted</p>
                    <p className="text-white text-sm">{new Date(selected.created_at).toLocaleString("en-MY")}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Type</p>
                    <p className="text-white text-sm">{TYPE_LABEL[selected.claim_type] || selected.claim_type}</p>
                  </div>
                  {selected.amount && (
                    <div>
                      <p className="text-white/40 text-xs">Amount</p>
                      <p className="text-secondary font-bold">RM {Number(selected.amount).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selected.description && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Description</p>
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 rounded-xl p-3">
                      {selected.description}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {selected.attachments?.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs mb-2">Attachments ({selected.attachments.length})</p>
                    <div className="flex flex-wrap gap-3">
                      {selected.attachments.map((att: any) => (
                        <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer">
                          {att.file_type === "application/pdf" ? (
                            <div className="w-20 h-20 bg-white/10 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/10 hover:border-primary/40 transition-all">
                              <FileText size={24} className="text-danger" />
                              <span className="text-white/60 text-[9px] px-1 text-center">PDF</span>
                            </div>
                          ) : (
                            <img src={att.file_url} alt="attachment" className="w-20 h-20 object-cover rounded-xl border border-white/10 hover:border-primary/40 transition-all" />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update status */}
                <div>
                  <p className="text-white/40 text-xs mb-1">Update Status</p>
                  <Select
                    selectedKeys={[newStatus]}
                    onSelectionChange={(keys) => setNewStatus(Array.from(keys)[0] as string)}
                    classNames={{ trigger: "bg-white/5 border border-white/10", value: "text-white capitalize" }}
                  >
                    {STATUSES.map((s) => (
                      <SelectItem key={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Admin notes */}
                <div>
                  <p className="text-white/40 text-xs mb-1">Response / Notes (visible to user)</p>
                  <Textarea
                    placeholder="Write a response to the user..."
                    value={adminNotes}
                    onValueChange={setAdminNotes}
                    minRows={3}
                    classNames={{
                      input: "text-white",
                      inputWrapper: "bg-white/5 border border-white/10 data-[focus=true]:border-primary",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  onPress={handleUpdate}
                  isLoading={saving}
                  className="font-bold"
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
