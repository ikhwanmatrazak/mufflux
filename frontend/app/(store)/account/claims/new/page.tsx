"use client";
import { useEffect, useRef, useState } from "react";
import {
  Button, Card, CardBody, Input, Textarea, Select, SelectItem, Spinner, Chip,
} from "@heroui/react";
import {
  Upload, Camera, Sparkles, X, FileText, Image as ImageIcon,
  CheckCircle, ArrowLeft, Send,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { claimsApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const CLAIM_TYPES = [
  { key: "warranty",   label: "Warranty Claim" },
  { key: "defect",     label: "Product Defect" },
  { key: "wrong_item", label: "Wrong Item Received" },
  { key: "refund",     label: "Refund Request" },
  { key: "service",    label: "Service Complaint" },
  { key: "other",      label: "Other" },
];

interface AttachedFile {
  file: File;
  preview: string | null; // URL for images, null for PDF
  isPdf: boolean;
}

export default function NewClaimPage() {
  const { user } = useUserStore();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [claimType, setClaimType] = useState("other");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  // ── File helpers ─────────────────────────────────────────────────────────

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const added: AttachedFile[] = [];
    for (const f of Array.from(newFiles)) {
      const isPdf = f.type === "application/pdf";
      const preview = isPdf ? null : URL.createObjectURL(f);
      added.push({ file: f, preview, isPdf });
    }
    setFiles((prev) => [...prev, ...added]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview!);
      updated.splice(idx, 1);
      return updated;
    });
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  // ── AI extraction ─────────────────────────────────────────────────────────

  const handleExtract = async (file: File) => {
    setExtracting(true);
    try {
      const { data } = await claimsApi.extract(file);
      const ex = data.extracted;
      if (ex.title) setTitle(ex.title);
      if (ex.description) setDescription(ex.description);
      if (ex.amount != null) setAmount(String(ex.amount));
      if (ex.claim_type) setClaimType(ex.claim_type);
      toast.success("Details auto-filled from your document!");
    } catch {
      toast.error("Could not extract details — please fill in manually.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFilePickWithExtract = (f: FileList | null) => {
    if (!f || f.length === 0) return;
    addFiles(f);
    // Auto-extract from first image file
    const firstImage = Array.from(f).find((x) => x.type.startsWith("image/"));
    if (firstImage) handleExtract(firstImage);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Please enter a claim title"); return; }
    setSubmitting(true);
    try {
      await claimsApi.create(
        { title: title.trim(), claim_type: claimType, description: description.trim() || undefined, amount: amount ? Number(amount) : undefined },
        files.map((f) => f.file),
      );
      toast.success("Claim submitted successfully!");
      router.push("/account/claims");
    } catch {
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account/claims">
          <Button isIconOnly variant="flat" size="sm" className="text-white/60">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">New Claim</h1>
          <p className="text-white/40 text-sm">Attach a photo/document and we'll auto-fill the details</p>
        </div>
      </div>

      {/* Upload zone */}
      <Card className="bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 transition-all mb-6">
        <CardBody className="p-0">
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="p-6"
          >
            {files.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Upload size={28} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Drop files here or choose an option</p>
                  <p className="text-white/40 text-sm mt-1">Supports JPG, PNG, PDF — max 10 MB each</p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    variant="flat"
                    color="primary"
                    startContent={<Upload size={15} />}
                    onPress={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </Button>
                  <Button
                    variant="flat"
                    color="secondary"
                    startContent={<Camera size={15} />}
                    onPress={() => cameraInputRef.current?.click()}
                  >
                    Take Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {files.map((af, i) => (
                    <div key={i} className="relative group">
                      {af.isPdf ? (
                        <div className="w-24 h-24 bg-white/10 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/10">
                          <FileText size={28} className="text-danger" />
                          <span className="text-white/60 text-[10px] text-center px-1 truncate w-full text-center">
                            {af.file.name}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={af.preview!}
                          alt={af.file.name}
                          className="w-24 h-24 object-cover rounded-xl border border-white/10"
                        />
                      )}
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 bg-white/5 rounded-xl border border-dashed border-white/20 flex items-center justify-center hover:border-primary/50 transition-all"
                  >
                    <Plus size={24} className="text-white/30" />
                  </button>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Upload size={13} />}
                    onPress={() => fileInputRef.current?.click()}
                  >
                    Add More
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    startContent={<Camera size={13} />}
                    onPress={() => cameraInputRef.current?.click()}
                  >
                    Snap Photo
                  </Button>
                  {files.some((f) => !f.isPdf) && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      startContent={extracting ? <Spinner size="sm" /> : <Sparkles size={13} />}
                      onPress={() => {
                        const img = files.find((f) => !f.isPdf);
                        if (img) handleExtract(img.file);
                      }}
                      isDisabled={extracting}
                    >
                      {extracting ? "Reading..." : "Auto-fill from Image"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFilePickWithExtract(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFilePickWithExtract(e.target.files)}
      />

      {/* AI extracting banner */}
      {extracting && (
        <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-3 mb-4">
          <Spinner size="sm" color="secondary" />
          <p className="text-secondary text-sm font-medium">Reading your document with AI — filling in details...</p>
        </div>
      )}

      {/* Claim details form */}
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Claim Title *</label>
          <Input
            placeholder="e.g. Exhaust pipe cracked after 2 weeks"
            value={title}
            onValueChange={setTitle}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-white/5 border border-white/10 hover:border-primary/40 data-[focus=true]:border-primary",
            }}
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Claim Type *</label>
          <Select
            selectedKeys={[claimType]}
            onSelectionChange={(keys) => setClaimType(Array.from(keys)[0] as string)}
            classNames={{
              trigger: "bg-white/5 border border-white/10 hover:border-primary/40 data-[open=true]:border-primary",
              value: "text-white",
            }}
          >
            {CLAIM_TYPES.map((t) => (
              <SelectItem key={t.key}>{t.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Description</label>
          <Textarea
            placeholder="Describe the issue in detail — what happened, when, and what you expect as resolution..."
            value={description}
            onValueChange={setDescription}
            minRows={4}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-white/5 border border-white/10 hover:border-primary/40 data-[focus=true]:border-primary",
            }}
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Claim Amount (RM) — optional</label>
          <Input
            type="number"
            placeholder="e.g. 350.00"
            value={amount}
            onValueChange={setAmount}
            startContent={<span className="text-white/40 text-sm">RM</span>}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-white/5 border border-white/10 hover:border-primary/40 data-[focus=true]:border-primary",
            }}
          />
        </div>

        <Button
          color="primary"
          size="lg"
          className="w-full font-black"
          startContent={submitting ? <Spinner size="sm" /> : <Send size={16} />}
          onPress={handleSubmit}
          isDisabled={submitting || !title.trim()}
        >
          {submitting ? "Submitting..." : "Submit Claim"}
        </Button>
      </div>
    </div>
  );
}

// Missing import
function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
