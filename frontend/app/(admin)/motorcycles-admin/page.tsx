"use client";
import { useEffect, useRef, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Chip, Spinner, Select, SelectItem, Avatar, Tabs, Tab,
} from "@heroui/react";
import { Plus, Edit2, Trash2, Bike, Upload, X, Cpu, Layers } from "lucide-react";
import { motorcycleApi } from "@/lib/api";
import toast from "react-hot-toast";

const currentYear = new Date().getFullYear();

// ── Brand Modal ───────────────────────────────────────────────────────────────
function BrandModal({
  isOpen, onClose, editing, onSaved,
}: {
  isOpen: boolean; onClose: () => void; editing: any | null; onSaved: (brand: any) => void;
}) {
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? "");
      setLogoFile(null);
      setLogoPreview(editing?.logo_url ?? null);
    }
  }, [isOpen, editing]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Brand name is required"); return; }
    setSaving(true);
    try {
      let brand: any;
      if (editing) {
        const { data } = await motorcycleApi.updateBrand(editing.id, { name: name.trim() });
        brand = data;
      } else {
        const { data } = await motorcycleApi.createBrand({ name: name.trim() });
        brand = data;
      }
      if (logoFile) {
        const { data: updated } = await motorcycleApi.uploadBrandLogo(brand.id, logoFile);
        brand = updated;
      }
      onSaved(brand);
      toast.success(editing ? "Brand updated" : "Brand created");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save brand");
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm"
      classNames={{ base: "bg-content1 border border-divider", header: "border-b border-divider pb-3", footer: "border-t border-divider pt-3" }}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bike size={16} className="text-primary" />
            </div>
            <p className="font-bold text-foreground">{editing ? "Edit Brand" : "Add Brand"}</p>
          </div>
        </ModalHeader>
        <ModalBody className="py-4 space-y-4">
          <Input
            label="Brand Name" variant="bordered" isRequired
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Honda, Yamaha, Kawasaki"
          />

          {/* Logo upload */}
          <div>
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Brand Logo</p>
            <div
              className="relative border-2 border-dashed border-divider rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-auto object-contain rounded-lg" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-danger rounded-full p-0.5 text-foreground"
                    onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(editing?.logo_url ?? null); }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-content2 flex items-center justify-center">
                    <Upload size={20} className="text-foreground/30" />
                  </div>
                  <p className="text-foreground/40 text-xs text-center">Click to upload logo<br />PNG, JPG, WebP — max 5 MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} className="font-semibold">Cancel</Button>
          <Button color="primary" isLoading={saving} onPress={handleSave} className="font-bold px-6">
            {editing ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Model Modal ───────────────────────────────────────────────────────────────
function ModelModal({
  isOpen, onClose, editing, brands, onSaved,
}: {
  isOpen: boolean; onClose: () => void; editing: any | null; brands: any[]; onSaved: (model: any) => void;
}) {
  const EMPTY = { brand_id: "", name: "", year_from: String(currentYear), year_to: "" };
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editing ? {
        brand_id: String(editing.brand_id),
        name: editing.name,
        year_from: String(editing.year_from),
        year_to: editing.year_to ? String(editing.year_to) : "",
      } : EMPTY);
    }
  }, [isOpen, editing]);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.brand_id || !form.name.trim() || !form.year_from) {
      toast.error("Brand, model name and year are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        brand_id: Number(form.brand_id),
        name: form.name.trim(),
        year_from: Number(form.year_from),
        year_to: form.year_to ? Number(form.year_to) : null,
      };
      if (editing) {
        const { data } = await motorcycleApi.updateModel(editing.id, payload);
        onSaved(data);
        toast.success("Model updated");
      } else {
        const { data } = await motorcycleApi.createModel(payload);
        onSaved(data);
        toast.success("Model created");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save model");
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm"
      classNames={{ base: "bg-content1 border border-divider", header: "border-b border-divider pb-3", footer: "border-t border-divider pt-3" }}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Layers size={16} className="text-secondary" />
            </div>
            <p className="font-bold text-foreground">{editing ? "Edit Model" : "Add Model"}</p>
          </div>
        </ModalHeader>
        <ModalBody className="py-4 space-y-4">
          <Select
            label="Brand" variant="bordered" isRequired
            selectedKeys={form.brand_id ? [form.brand_id] : []}
            onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
          >
            {brands.map((b) => <SelectItem key={String(b.id)}>{b.name}</SelectItem>)}
          </Select>
          <Input
            label="Model Name" variant="bordered" isRequired
            value={form.name} onChange={set("name")}
            placeholder="e.g. CBR150R, R15, Ninja 400"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Year From" variant="bordered" isRequired type="number"
              value={form.year_from} onChange={set("year_from")}
              placeholder={String(currentYear)}
            />
            <Input
              label="Year To" variant="bordered" type="number"
              value={form.year_to} onChange={set("year_to")}
              placeholder="Present"
              description="Leave blank if current"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} className="font-semibold">Cancel</Button>
          <Button color="secondary" isLoading={saving} onPress={handleSave} className="font-bold px-6">
            {editing ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MotorcyclesAdminPage() {
  const brandModal = useDisclosure();
  const modelModal = useDisclosure();

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [editingModel, setEditingModel] = useState<any | null>(null);

  const [modelFilter, setModelFilter] = useState<string>("");
  const [newEngine, setNewEngine] = useState({ cc: "", label: "" });
  const [addingEngine, setAddingEngine] = useState(false);

  useEffect(() => {
    Promise.all([
      motorcycleApi.brands(),
      motorcycleApi.models(),
      motorcycleApi.engines(),
    ]).then(([b, m, e]) => {
      setBrands(b.data);
      setModels(m.data);
      setEngines(e.data);
    }).finally(() => setLoading(false));
  }, []);

  const openAddBrand = () => { setEditingBrand(null); brandModal.onOpen(); };
  const openEditBrand = (b: any) => { setEditingBrand(b); brandModal.onOpen(); };
  const openAddModel = () => { setEditingModel(null); modelModal.onOpen(); };
  const openEditModel = (m: any) => { setEditingModel(m); modelModal.onOpen(); };

  const onBrandSaved = (brand: any) => {
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === brand.id);
      return idx >= 0 ? prev.map((b) => b.id === brand.id ? brand : b) : [brand, ...prev];
    });
  };

  const onModelSaved = (model: any) => {
    setModels((prev) => {
      const idx = prev.findIndex((m) => m.id === model.id);
      return idx >= 0 ? prev.map((m) => m.id === model.id ? model : m) : [model, ...prev];
    });
  };

  const deleteBrand = async (id: number) => {
    if (!confirm("Delete this brand and all its models?")) return;
    await motorcycleApi.deleteBrand(id);
    setBrands((p) => p.filter((b) => b.id !== id));
    setModels((p) => p.filter((m) => m.brand_id !== id));
    toast.success("Brand deleted");
  };

  const deleteModel = async (id: number) => {
    if (!confirm("Delete this model?")) return;
    await motorcycleApi.deleteModel(id);
    setModels((p) => p.filter((m) => m.id !== id));
    toast.success("Model deleted");
  };

  const addEngine = async () => {
    if (!newEngine.cc || !newEngine.label.trim()) { toast.error("CC and label are required"); return; }
    setAddingEngine(true);
    try {
      const { data } = await motorcycleApi.createEngine({ cc: Number(newEngine.cc), label: newEngine.label.trim() });
      setEngines((p) => [...p, data].sort((a, b) => a.cc - b.cc));
      setNewEngine({ cc: "", label: "" });
      toast.success("Engine size added");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to add engine");
    } finally { setAddingEngine(false); }
  };

  const deleteEngine = async (id: number) => {
    if (!confirm("Delete this engine size?")) return;
    await motorcycleApi.deleteEngine(id);
    setEngines((p) => p.filter((e) => e.id !== id));
    toast.success("Engine size deleted");
  };

  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b]));
  const filteredModels = modelFilter
    ? models.filter((m) => String(m.brand_id) === modelFilter)
    : models;

  if (loading) return <div className="flex justify-center py-32"><Spinner color="primary" /></div>;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Motorcycle Database</h1>
        <p className="text-foreground/40 text-sm mt-0.5">
          {brands.length} brands · {models.length} models · {engines.length} engine sizes
        </p>
      </div>

      <Tabs
        variant="underlined"
        color="primary"
        classNames={{ tabList: "border-b border-divider w-full", cursor: "bg-primary" }}
      >

        {/* ── BRANDS TAB ── */}
        <Tab key="brands" title={
          <span className="flex items-center gap-2">
            <Bike size={15} /> Brands
            <Chip size="sm" variant="flat" color="primary" className="text-xs h-5">{brands.length}</Chip>
          </span>
        }>
          <div className="pt-6">
            <div className="flex justify-end mb-4">
              <Button color="primary" startContent={<Plus size={16} />} onPress={openAddBrand} className="font-bold">
                Add Brand
              </Button>
            </div>

            <Table aria-label="Motorcycle Brands" className="bg-content1">
              <TableHeader>
                <TableColumn className="bg-content2 text-foreground/60">LOGO</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">BRAND NAME</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">MODELS</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={<p className="text-foreground/30 py-8">No brands yet — add one above</p>}>
                {brands.map((b) => (
                  <TableRow key={b.id} className="border-b border-[#1a1a1a]">
                    <TableCell>
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="h-9 w-9 object-contain rounded-lg bg-content2 p-1" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-content2 flex items-center justify-center">
                          <Bike size={16} className="text-foreground/30" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground font-semibold">{b.name}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">
                        {models.filter((m) => m.brand_id === b.id).length} models
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-primary" onPress={() => openEditBrand(b)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => deleteBrand(b.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>

        {/* ── MODELS TAB ── */}
        <Tab key="models" title={
          <span className="flex items-center gap-2">
            <Layers size={15} /> Models
            <Chip size="sm" variant="flat" color="secondary" className="text-xs h-5">{models.length}</Chip>
          </span>
        }>
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <Select
                variant="bordered" size="sm" className="max-w-xs"
                placeholder="Filter by brand"
                selectedKeys={modelFilter ? [modelFilter] : []}
                onChange={(e) => setModelFilter(e.target.value)}
              >
                {brands.map((b) => <SelectItem key={String(b.id)}>{b.name}</SelectItem>)}
              </Select>
              <div className="flex gap-2">
                {modelFilter && (
                  <Button size="sm" variant="flat" onPress={() => setModelFilter("")} className="font-semibold">
                    Clear Filter
                  </Button>
                )}
                <Button color="secondary" startContent={<Plus size={16} />} onPress={openAddModel} className="font-bold">
                  Add Model
                </Button>
              </div>
            </div>

            <Table aria-label="Motorcycle Models" className="bg-content1">
              <TableHeader>
                <TableColumn className="bg-content2 text-foreground/60">BRAND</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">MODEL NAME</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">YEAR RANGE</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={<p className="text-foreground/30 py-8">No models found</p>}>
                {filteredModels.map((m) => (
                  <TableRow key={m.id} className="border-b border-[#1a1a1a]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {brandMap[m.brand_id]?.logo_url ? (
                          <img src={brandMap[m.brand_id].logo_url} alt="" className="h-6 w-6 object-contain rounded" />
                        ) : (
                          <div className="h-6 w-6 rounded bg-content2 flex items-center justify-center">
                            <Bike size={12} className="text-foreground/30" />
                          </div>
                        )}
                        <span className="text-foreground/70 text-sm font-medium">{brandMap[m.brand_id]?.name ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground font-semibold">{m.name}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">
                        {m.year_from} – {m.year_to ?? "Present"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-secondary" onPress={() => openEditModel(m)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => deleteModel(m.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>

        {/* ── ENGINE SIZES TAB ── */}
        <Tab key="engines" title={
          <span className="flex items-center gap-2">
            <Cpu size={15} /> Engine Sizes
            <Chip size="sm" variant="flat" color="warning" className="text-xs h-5">{engines.length}</Chip>
          </span>
        }>
          <div className="pt-6 max-w-lg">
            {/* Add engine inline form */}
            <div className="bg-content1 border border-divider rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-warning mb-3">Add Engine Size</p>
              <div className="flex gap-3 items-end">
                <Input
                  label="Displacement (cc)" variant="bordered" type="number" size="sm"
                  value={newEngine.cc} onChange={(e) => setNewEngine((p) => ({ ...p, cc: e.target.value }))}
                  placeholder="e.g. 150"
                  className="flex-1"
                />
                <Input
                  label="Label" variant="bordered" size="sm"
                  value={newEngine.label} onChange={(e) => setNewEngine((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. 150cc"
                  className="flex-1"
                />
                <Button color="warning" isLoading={addingEngine} onPress={addEngine} startContent={<Plus size={15} />} className="font-bold shrink-0">
                  Add
                </Button>
              </div>
            </div>

            <Table aria-label="Engine Sizes" className="bg-content1">
              <TableHeader>
                <TableColumn className="bg-content2 text-foreground/60">CC</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">LABEL</TableColumn>
                <TableColumn className="bg-content2 text-foreground/60">DELETE</TableColumn>
              </TableHeader>
              <TableBody emptyContent={<p className="text-foreground/30 py-8">No engine sizes yet</p>}>
                {engines.map((e) => (
                  <TableRow key={e.id} className="border-b border-[#1a1a1a]">
                    <TableCell>
                      <span className="text-foreground font-bold font-mono">{e.cc}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="warning">{e.label}</Chip>
                    </TableCell>
                    <TableCell>
                      <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => deleteEngine(e.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      {/* Modals */}
      <BrandModal
        isOpen={brandModal.isOpen} onClose={brandModal.onClose}
        editing={editingBrand} onSaved={onBrandSaved}
      />
      <ModelModal
        isOpen={modelModal.isOpen} onClose={modelModal.onClose}
        editing={editingModel} brands={brands} onSaved={onModelSaved}
      />
    </div>
  );
}
