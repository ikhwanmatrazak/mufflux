"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Chip, Spinner, Textarea, Select, SelectItem, Switch, Divider,
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, Package, DollarSign, Layers, FileText, Tag, BarChart2 } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

const EMPTY = {
  name_en: "", name_bm: "", slug: "", sku: "", price: "", compare_price: "",
  stock_qty: "", weight_kg: "", description_en: "", description_bm: "",
  category_id: "", is_active: true,
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function SectionHeader({ icon: Icon, label, color = "text-primary" }: { icon: any; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <Icon size={15} className={color} />
      <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
    </div>
  );
}

export default function AdminProductsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [slugLocked, setSlugLocked] = useState(false);

  useEffect(() => {
    Promise.all([productsApi.list({ limit: 100 }), categoriesApi.list()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  const handleNameEN = (val: string) => {
    set("name_en", val);
    if (!slugLocked) set("slug", slugify(val));
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setSlugLocked(false); onOpen(); };
  const openEdit = (p: any) => {
    setEditing(p);
    setSlugLocked(true);
    setForm({
      ...p,
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : "",
      stock_qty: String(p.stock_qty),
      weight_kg: p.weight_kg ? String(p.weight_kg) : "",
      category_id: p.category_id ? String(p.category_id) : "",
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!form.name_en || !form.price || !form.slug) {
      toast.error("Name (EN), Slug and Price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock_qty: Number(form.stock_qty) || 0,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        category_id: form.category_id ? Number(form.category_id) : null,
      };
      if (editing) {
        const { data } = await productsApi.update(editing.id, payload);
        setProducts(p => p.map(x => x.id === editing.id ? data : x));
        toast.success("Product updated");
      } else {
        const { data } = await productsApi.create(payload);
        setProducts(p => [data, ...p]);
        toast.success("Product created");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id);
    setProducts(p => p.filter(x => x.id !== id));
    toast.success("Product deleted");
  };

  const filtered = products.filter(p =>
    p.name_en.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const discount = form.compare_price && form.price
    ? Math.round((1 - Number(form.price) / Number(form.compare_price)) * 100)
    : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Products</h1>
          <p className="text-foreground/40 text-sm">{products.length} total products</p>
        </div>
        <Button color="primary" startContent={<Plus size={16} />} onPress={openAdd} className="font-bold">
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name or SKU…"
          startContent={<Search size={16} className="text-foreground/30" />}
          variant="bordered" className="max-w-sm"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner color="primary" /></div>
      ) : (
        <Table aria-label="Products" className="bg-content1">
          <TableHeader>
            <TableColumn className="bg-content2 text-foreground/60">NAME</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">SKU</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">PRICE</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">STOCK</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">STATUS</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-foreground/30 py-8">No products found</p>}>
            {filtered.map((p) => (
              <TableRow key={p.id} className="border-b border-[#1a1a1a]">
                <TableCell>
                  <div>
                    <p className="text-foreground font-medium">{p.name_en}</p>
                    {p.name_bm && <p className="text-foreground/30 text-xs">{p.name_bm}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-foreground/50 text-sm font-mono">{p.sku || "—"}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-primary font-bold">RM{Number(p.price).toFixed(2)}</p>
                    {p.compare_price && (
                      <p className="text-foreground/30 text-xs line-through">RM{Number(p.compare_price).toFixed(2)}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={p.stock_qty === 0 ? "danger" : p.stock_qty <= 5 ? "warning" : "success"} variant="flat">
                    {p.stock_qty} units
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={p.is_active ? "success" : "default"} variant="flat">
                    {p.is_active ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-primary" onPress={() => openEdit(p)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside"
        classNames={{ base: "bg-content1 border border-divider", header: "border-b border-divider pb-3", footer: "border-t border-divider pt-3" }}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-foreground font-bold">{editing ? "Edit Product" : "Add New Product"}</p>
                <p className="text-foreground/40 text-xs font-normal">{editing ? `Editing: ${editing.name_en}` : "Fill in the product details below"}</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="py-4 space-y-5">

            {/* ── Basic Info ── */}
            <SectionHeader icon={Tag} label="Basic Information" />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Product Name (English)" placeholder="e.g. Racing Exhaust Pipe"
                isRequired variant="bordered" value={form.name_en}
                onChange={(e) => handleNameEN(e.target.value)}
                description="Primary display name"
              />
              <Input
                label="Product Name (BM)" placeholder="e.g. Paip Ekzos Lumba"
                variant="bordered" value={form.name_bm}
                onChange={(e) => set("name_bm", e.target.value)}
                description="Shown in Bahasa Melayu mode"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Slug" placeholder="auto-generated from name"
                variant="bordered" value={form.slug}
                onChange={(e) => { setSlugLocked(true); set("slug", slugify(e.target.value)); }}
                description="URL-friendly identifier"
                startContent={<span className="text-foreground/30 text-xs">/products/</span>}
              />
              <Input
                label="SKU" placeholder="e.g. MFX-001"
                variant="bordered" value={form.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                description="Stock Keeping Unit"
              />
            </div>

            <Divider className="opacity-30" />

            {/* ── Pricing ── */}
            <SectionHeader icon={DollarSign} label="Pricing" color="text-success" />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Selling Price (MYR)" placeholder="0.00"
                isRequired type="number" variant="bordered" value={form.price}
                onChange={(e) => set("price", e.target.value)}
                startContent={<span className="text-foreground/50 text-sm font-bold">RM</span>}
              />
              <Input
                label="Compare-at Price (MYR)" placeholder="0.00"
                type="number" variant="bordered" value={form.compare_price}
                onChange={(e) => set("compare_price", e.target.value)}
                startContent={<span className="text-foreground/50 text-sm font-bold">RM</span>}
                description={discount ? `${discount}% off shown to customers` : "Original price for strike-through"}
              />
            </div>

            <Divider className="opacity-30" />

            {/* ── Inventory ── */}
            <SectionHeader icon={BarChart2} label="Inventory & Shipping" color="text-warning" />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Stock Quantity" placeholder="0"
                type="number" variant="bordered" value={form.stock_qty}
                onChange={(e) => set("stock_qty", e.target.value)}
              />
              <Input
                label="Weight (kg)" placeholder="0.00"
                type="number" variant="bordered" value={form.weight_kg}
                onChange={(e) => set("weight_kg", e.target.value)}
              />
              <Select
                label="Category" variant="bordered"
                selectedKeys={form.category_id ? [form.category_id] : []}
                onChange={(e) => set("category_id", e.target.value)}
              >
                {categories.map((c) => <SelectItem key={String(c.id)}>{c.name_en}</SelectItem>)}
              </Select>
            </div>

            <div className="flex items-center justify-between bg-content2 rounded-xl px-4 py-3 border border-divider">
              <div>
                <p className="text-foreground text-sm font-semibold">Published</p>
                <p className="text-foreground/40 text-xs">Visible to customers on the store</p>
              </div>
              <Switch isSelected={form.is_active} onValueChange={(v) => set("is_active", v)} color="success" />
            </div>

            <Divider className="opacity-30" />

            {/* ── Descriptions ── */}
            <SectionHeader icon={FileText} label="Descriptions" color="text-secondary" />
            <Textarea
              label="Description (English)" placeholder="Describe the product features, specs, and benefits…"
              variant="bordered" value={form.description_en} minRows={3}
              onChange={(e) => set("description_en", e.target.value)}
            />
            <Textarea
              label="Description (BM)" placeholder="Terangkan ciri-ciri, spesifikasi dan manfaat produk…"
              variant="bordered" value={form.description_bm} minRows={3}
              onChange={(e) => set("description_bm", e.target.value)}
            />
          </ModalBody>

          <ModalFooter className="flex items-center justify-between">
            <p className="text-foreground/30 text-xs">
              {editing ? `ID: ${editing.id}` : "Fields marked * are required"}
            </p>
            <div className="flex gap-2">
              <Button variant="flat" onPress={onClose} className="font-semibold">Cancel</Button>
              <Button color="primary" isLoading={saving} onPress={handleSave} className="font-bold px-6">
                {editing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
