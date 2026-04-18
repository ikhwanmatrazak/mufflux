"use client";
import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Chip, Spinner,
} from "@heroui/react";
import { FileText, Plus, ChevronRight, AlertCircle } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { claimsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

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

export default function ClaimsPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    claimsApi.list()
      .then((r) => setClaims(r.data))
      .catch(() => toast.error("Failed to load claims"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">My Claims</h1>
          <p className="text-white/40 text-sm mt-1">Submit and track your warranty or service claims</p>
        </div>
        <Link href="/account/claims/new">
          <Button color="primary" startContent={<Plus size={16} />} className="font-bold">
            New Claim
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner color="primary" /></div>
      ) : claims.length === 0 ? (
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="flex flex-col items-center py-16 gap-4">
            <AlertCircle size={48} className="text-white/20" />
            <p className="text-white/40 text-center">No claims yet.<br />Submit a claim if you have an issue with your order.</p>
            <Link href="/account/claims/new">
              <Button color="primary" variant="flat" startContent={<Plus size={14} />}>
                Submit First Claim
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {claims.map((claim) => (
            <Link key={claim.id} href={`/account/claims/${claim.id}`}>
              <Card className="bg-white/5 border border-white/10 hover:border-primary/40 transition-all cursor-pointer">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{claim.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-white/40 text-xs">
                            {TYPE_LABEL[claim.claim_type] || claim.claim_type}
                          </span>
                          <span className="text-white/20 text-xs">•</span>
                          <span className="text-white/40 text-xs">
                            {new Date(claim.created_at).toLocaleDateString("en-MY")}
                          </span>
                          {claim.amount && (
                            <>
                              <span className="text-white/20 text-xs">•</span>
                              <span className="text-secondary text-xs font-semibold">
                                RM{Number(claim.amount).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Chip size="sm" color={STATUS_COLOR[claim.status] || "default"} variant="flat">
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </Chip>
                      <ChevronRight size={16} className="text-white/30" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
