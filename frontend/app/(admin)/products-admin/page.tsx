"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Chip, Spinner, Textarea, Select, SelectItem
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, Upload } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const EMPTY = { name_en: "", name_bm: "", slug: "", sku: "", price: "", compare_price: "", stock_qty: "", weight_kg: "", description_en: "", description_bm: "", category_id: "", is_active: true };
  const [form, setForm] = useState<any>(EMPTY);

  useEffect(() => {
    Promise.all([productsApi.list({ limit: 100 }), categoriesApi.list()]).then(([p, c]) => {
      setProducts(p.data); setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); onOpen(); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ ...p, price: String(p.price), compare_price: p.compare_price ? String(p.compare_price) : "", stock_qty: String(p.stock_qty), weight_kg: p.weight_kg ? String(p.weight_kg) : "", category_id: p.category_id ? String(p.category_id) : "" });
    onOpen();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), compare_price: form.compare_price ? Number(form.compare_price) : null, stock_qty: Number(form.stock_qty), weight_kg: form.weight_kg ? Number(form.weight_kg) : null, category_id: form.category_id ? Number(form.category_id) : null };
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
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed to save product"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id);
    setProducts(p => p.filter(x => x.id !== id));
    toast.success("Product deleted");
  };

  const filtered = products.filter(p => p.name_en.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-foreground/40 text-sm">{products.length} total products</p>
        </div>
        <Button color="primary" startContent={<Plus size={16} />} onPress={openAdd} className="font-bold">Add Product</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search products..." startContent={<Search size={16} className="text-foreground/30" />}
          variant="bordered" className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Products" className="bg-[#111]">
          <TableHeader>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">NAME</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">SKU</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">PRICE</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">STOCK</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">STATUS</TableColumn>
            <TableColumn className="bg-[#1a1a1a] text-foreground/60">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-foreground/30 py-8">No products found</p>}>
            {filtered.map((p) => (
              <TableRow key={p.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-white font-medium">{p.name_en}</TableCell>
                <TableCell className="text-foreground/50 text-sm font-mono">{p.sku}</TableCell>
                <TableCell className="text-primary font-bold">RM{Number(p.price).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip size="sm" color={p.stock_qty === 0 ? "danger" : p.stock_qty <= 5 ? "warning" : "success"} variant="flat">
                    {p.stock_qty}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={p.is_active ? "success" : "default"} variant="flat">
                    {p.is_active ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-primary" onPress={() => openEdit(p)}><Edit2 size={14} /></Button>
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-danger" onPress={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" className="bg-[#1a1a1a] border border-[#333]" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="text-white">{editing ? "Edit Product" : "Add Product"}</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name (EN)" variant="bordered" value={form.name_en} onChange={(e) => setForm((f: any) => ({ ...f, name_en: e.target.value }))} />
              <Input label="Name (BM)" variant="bordered" value={form.name_bm} onChange={(e) => setForm((f: any) => ({ ...f, name_bm: e.target.value }))} />
              <Input label="Slug" variant="bordered" value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} />
              <Input label="SKU" variant="bordered" value={form.sku} onChange={(e) => setForm((f: any) => ({ ...f, sku: e.target.value }))} />
              <Input label="Price (MYR)" type="number" variant="bordered" value={form.price} onChange={(e) => setForm((f: any) => ({ ...f, price: e.target.value }))} />
              <Input label="Compare Price" type="number" variant="bordered" value={form.compare_price} onChange={(e) => setForm((f: any) => ({ ...f, compare_price: e.target.value }))} />
              <Input label="Stock Qty" type="number" variant="bordered" value={form.stock_qty} onChange={(e) => setForm((f: any) => ({ ...f, stock_qty: e.target.value }))} />
              <Input label="Weight (kg)" type="number" variant="bordered" value={form.weight_kg} onChange={(e) => setForm((f: any) => ({ ...f, weight_kg: e.target.value }))} />
              <Select label="Category" variant="bordered" selectedKeys={form.category_id ? [form.category_id] : []}
                onChange={(e) => setForm((f: any) => ({ ...f, category_id: e.target.value }))}>
                {categories.map((c) => <SelectItem key={String(c.id)}>{c.name_en}</SelectItem>)}
              </Select>
            </div>
            <Textarea label="Description (EN)" variant="bordered" value={form.description_en} rows={3} onChange={(e) => setForm((f: any) => ({ ...f, description_en: e.target.value }))} />
            <Textarea label="Description (BM)" variant="bordered" value={form.description_bm} rows={3} onChange={(e) => setForm((f: any) => ({ ...f, description_bm: e.target.value }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" isLoading={saving} onPress={handleSave}>Save Product</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
