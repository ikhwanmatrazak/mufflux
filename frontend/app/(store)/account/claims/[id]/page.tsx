"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Chip, Button, Spinner, Divider } from "@heroui/react";
import { ArrowLeft, FileText, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter, useParams } from "next/navigation";
import { claimsApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_COLOR: Record<string, "warning" | "primary" | "success" | "danger" | "default"> = {
  pending: "warning",
  reviewing: "primary",
  approved: "success",
  rejected: "danger",
};

const TYPE_LABEL: Record<string, string> = {
  warranty: "Warranty",
  defect: "Product Defect",
  wrong_item: "Wrong Item",
  refund: "Refund",
  service: "Service",
  other: "Other",
};

export default function ClaimDetailPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    claimsApi.get(Number(params.id))
      .then((r) => setClaim(r.data))
      .catch(() => toast.error("Claim not found"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  if (loading) return (
    <div className="flex justify-center py-20"><Spinner color="primary" /></div>
  );

  if (!claim) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-white/40">
      Claim not found.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account/claims">
          <Button isIconOnly variant="flat" size="sm" className="text-white/60">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate">{claim.title}</h1>
          <p className="text-white/40 text-sm">
            Submitted {new Date(claim.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Chip color={STATUS_COLOR[claim.status] || "default"} variant="flat">
          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
        </Chip>
      </div>

      <div className="space-y-4">
        {/* Details */}
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 text-xs mb-1">Claim Type</p>
                <p className="text-white font-semibold">{TYPE_LABEL[claim.claim_type] || claim.claim_type}</p>
              </div>
              {claim.amount && (
                <div>
                  <p className="text-white/40 text-xs mb-1">Amount</p>
                  <p className="text-secondary font-bold">RM {Number(claim.amount).toFixed(2)}</p>
                </div>
              )}
            </div>
            {claim.description && (
              <>
                <Divider className="bg-white/10" />
                <div>
                  <p className="text-white/40 text-xs mb-1">Description</p>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{claim.description}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Attachments */}
        {claim.attachments?.length > 0 && (
          <Card className="bg-white/5 border border-white/10">
            <CardBody className="p-5">
              <p className="text-white/40 text-xs mb-3">Attachments ({claim.attachments.length})</p>
              <div className="flex flex-wrap gap-3">
                {claim.attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {att.file_type === "application/pdf" ? (
                      <div className="w-24 h-24 bg-white/10 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/10 hover:border-primary/40 transition-all">
                        <FileText size={28} className="text-danger" />
                        <span className="text-white/60 text-[10px] px-1 text-center truncate w-full">
                          {att.original_filename || "PDF"}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={att.file_url}
                        alt={att.original_filename || "attachment"}
                        className="w-24 h-24 object-cover rounded-xl border border-white/10 hover:border-primary/40 transition-all"
                      />
                    )}
                  </a>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Admin notes */}
        {claim.admin_notes && (
          <Card className="bg-primary/10 border border-primary/30">
            <CardBody className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-primary" />
                <p className="text-primary text-sm font-semibold">Response from Mufflux Team</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{claim.admin_notes}</p>
            </CardBody>
          </Card>
        )}

        {/* Status timeline */}
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="p-5">
            <p className="text-white/40 text-xs mb-3">Status</p>
            <div className="flex items-center gap-0">
              {["pending", "reviewing", "approved"].map((s, i) => {
                const steps = ["pending", "reviewing", "approved", "rejected"];
                const currentIdx = steps.indexOf(claim.status);
                const stepIdx = steps.indexOf(s);
                const isRejected = claim.status === "rejected";
                const isActive = isRejected ? s === "pending" : stepIdx <= currentIdx;
                return (
                  <div key={s} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1`}>
                      <div className={`w-3 h-3 rounded-full transition-all ${isActive ? "bg-primary" : "bg-white/20"}`} />
                      <span className={`text-[10px] ${isActive ? "text-primary" : "text-white/30"}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={`w-16 h-0.5 mb-4 ${isActive && stepIdx < currentIdx ? "bg-primary" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
              {claim.status === "rejected" && (
                <div className="flex items-center">
                  <div className="w-16 h-0.5 mb-4 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-danger" />
                    <span className="text-[10px] text-danger">Rejected</span>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
