"use client";
import { useEffect, useState } from "react";
import {
  Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Spinner, Select, SelectItem,
} from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { motorcycleApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function MotorcyclesAdminPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const brandModal = useDisclosure();
  const modelModal = useDisclosure();
  const engineModal = useDisclosure();

  const [brandForm, setBrandForm] = useState({ name: "", logo_url: "" });
  const [modelForm, setModelForm] = useState({ name: "", brand_id: "", year_start: "", year_end: "" });
  const [engineForm, setEngineForm] = useState({ cc: "", label: "" });

  const load = () => {
    setLoading(true);
    Promise.all([motorcycleApi.brands(), motorcycleApi.models(), motorcycleApi.engines()])
      .then(([b, m, e]) => { setBrands(b.data); setModels(m.data); setEngines(e.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveBrand = async () => {
    try {
      await motorcycleApi.createBrand({ name: brandForm.name, logo_url: brandForm.logo_url || null });
      toast.success("Brand added"); brandModal.onClose(); setBrandForm({ name: "", logo_url: "" }); load();
    } catch { toast.error("Failed to add brand"); }
  };

  const saveModel = async () => {
    try {
      await motorcycleApi.createModel({ name: modelForm.name, brand_id: Number(modelForm.brand_id), year_start: modelForm.year_start ? Number(modelForm.year_start) : null, year_end: modelForm.year_end ? Number(modelForm.year_end) : null });
      toast.success("Model added"); modelModal.onClose(); setModelForm({ name: "", brand_id: "", year_start: "", year_end: "" }); load();
    } catch { toast.error("Failed to add model"); }
  };

  const saveEngine = async () => {
    try {
      await motorcycleApi.createEngine({ cc: Number(engineForm.cc), label: engineForm.label || `${engineForm.cc}cc` });
      toast.success("Engine size added"); engineModal.onClose(); setEngineForm({ cc: "", label: "" }); load();
    } catch { toast.error("Failed to add engine size"); }
  };

  const delBrand = async (id: number) => {
    if (!confirm("Delete brand? This will remove all its models.")) return;
    await motorcycleApi.deleteBrand(id); toast.success("Deleted"); load();
  };
  const delModel = async (id: number) => {
    if (!confirm("Delete model?")) return;
    await motorcycleApi.deleteModel(id); toast.success("Deleted"); load();
  };
  const delEngine = async (id: number) => {
    if (!confirm("Delete engine size?")) return;
    await motorcycleApi.deleteEngine(id); toast.success("Deleted"); load();
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-black text-foreground mb-1">Motorcycle Database</h1>
      <p className="text-foreground/40 text-sm mb-6">
        {brands.length} brands · {models.length} models · {engines.length} engine sizes
      </p>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner color="primary" /></div>
      ) : (
        <Tabs color="primary" variant="underlined">
          {/* ── BRANDS ── */}
          <Tab key="brands" title={`Brands ${brands.length}`}>
            <div className="flex justify-end mb-4">
              <Button color="primary" startContent={<Plus size={16} />} onPress={brandModal.onOpen}>Add Brand</Button>
            </div>
            <Table aria-label="Brands">
              <TableHeader>
                <TableColumn>LOGO</TableColumn>
                <TableColumn>BRAND NAME</TableColumn>
                <TableColumn>MODELS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No brands yet — add one above">
                {brands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.logo_url ? <img src={b.logo_url} alt={b.name} className="h-8 w-auto object-contain" /> : <span className="text-foreground/30 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">{b.name}</TableCell>
                    <TableCell className="text-foreground/50">{models.filter(m => m.brand_id === b.id).length}</TableCell>
                    <TableCell>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => delBrand(b.id)}><Trash2 size={14} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tab>

          {/* ── MODELS ── */}
          <Tab key="models" title={`Models ${models.length}`}>
            <div className="flex justify-end mb-4">
              <Button color="primary" startContent={<Plus size={16} />} onPress={modelModal.onOpen}>Add Model</Button>
            </div>
            <Table aria-label="Models">
              <TableHeader>
                <TableColumn>BRAND</TableColumn>
                <TableColumn>MODEL NAME</TableColumn>
                <TableColumn>YEAR RANGE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No models yet">
                {models.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-foreground/50">{brands.find(b => b.id === m.brand_id)?.name || "—"}</TableCell>
                    <TableCell className="text-foreground font-medium">{m.name}</TableCell>
                    <TableCell className="text-foreground/50">{m.year_start || "—"}{m.year_end ? ` – ${m.year_end}` : ""}</TableCell>
                    <TableCell>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => delModel(m.id)}><Trash2 size={14} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tab>

          {/* ── ENGINES ── */}
          <Tab key="engines" title={`Engine Sizes ${engines.length}`}>
            <div className="flex justify-end mb-4">
              <Button color="primary" startContent={<Plus size={16} />} onPress={engineModal.onOpen}>Add Engine Size</Button>
            </div>
            <Table aria-label="Engine Sizes">
              <TableHeader>
                <TableColumn>CC</TableColumn>
                <TableColumn>LABEL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No engine sizes yet">
                {engines.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-foreground font-mono">{e.cc}cc</TableCell>
                    <TableCell className="text-foreground/70">{e.label}</TableCell>
                    <TableCell>
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => delEngine(e.id)}><Trash2 size={14} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tab>
        </Tabs>
      )}

      {/* Add Brand Modal */}
      <Modal isOpen={brandModal.isOpen} onClose={brandModal.onClose}>
        <ModalContent>
          <ModalHeader className="text-foreground">Add Motorcycle Brand</ModalHeader>
          <ModalBody>
            <Input label="Brand Name" value={brandForm.name} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value }))} isRequired />
            <Input label="Logo URL (optional)" value={brandForm.logo_url} onChange={e => setBrandForm(f => ({ ...f, logo_url: e.target.value }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={brandModal.onClose}>Cancel</Button>
            <Button color="primary" onPress={saveBrand} isDisabled={!brandForm.name}>Add Brand</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Model Modal */}
      <Modal isOpen={modelModal.isOpen} onClose={modelModal.onClose}>
        <ModalContent>
          <ModalHeader className="text-foreground">Add Motorcycle Model</ModalHeader>
          <ModalBody>
            <Select label="Brand" selectedKeys={modelForm.brand_id ? [modelForm.brand_id] : []} onChange={e => setModelForm(f => ({ ...f, brand_id: e.target.value }))}>
              {brands.map(b => <SelectItem key={String(b.id)}>{b.name}</SelectItem>)}
            </Select>
            <Input label="Model Name" value={modelForm.name} onChange={e => setModelForm(f => ({ ...f, name: e.target.value }))} isRequired />
            <div className="flex gap-3">
              <Input label="Year Start" type="number" value={modelForm.year_start} onChange={e => setModelForm(f => ({ ...f, year_start: e.target.value }))} />
              <Input label="Year End" type="number" value={modelForm.year_end} onChange={e => setModelForm(f => ({ ...f, year_end: e.target.value }))} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={modelModal.onClose}>Cancel</Button>
            <Button color="primary" onPress={saveModel} isDisabled={!modelForm.name || !modelForm.brand_id}>Add Model</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Engine Modal */}
      <Modal isOpen={engineModal.isOpen} onClose={engineModal.onClose}>
        <ModalContent>
          <ModalHeader className="text-foreground">Add Engine Size</ModalHeader>
          <ModalBody>
            <Input label="CC (e.g. 150)" type="number" value={engineForm.cc} onChange={e => setEngineForm(f => ({ ...f, cc: e.target.value }))} isRequired />
            <Input label="Label (e.g. 150cc)" value={engineForm.label} onChange={e => setEngineForm(f => ({ ...f, label: e.target.value }))} placeholder="Auto-filled if blank" />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={engineModal.onClose}>Cancel</Button>
            <Button color="primary" onPress={saveEngine} isDisabled={!engineForm.cc}>Add Engine Size</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
