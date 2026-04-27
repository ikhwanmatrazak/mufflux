"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Switch, Tabs, Tab } from "@heroui/react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { blogApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function TiptapEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "min-h-[200px] p-4 text-foreground/80 focus:outline-none prose prose-invert max-w-none" },
    },
  });
  return (
    <div className="border border-divider rounded-xl overflow-hidden bg-content1">
      <div className="border-b border-divider p-2 flex gap-2">
        {[
          { label: "B", cmd: () => editor?.chain().focus().toggleBold().run() },
          { label: "I", cmd: () => editor?.chain().focus().toggleItalic().run() },
          { label: "H2", cmd: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
          { label: "UL", cmd: () => editor?.chain().focus().toggleBulletList().run() },
        ].map((b) => (
          <button key={b.label} onMouseDown={(e) => { e.preventDefault(); b.cmd(); }}
            className="px-3 py-1 text-xs font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/10 rounded-lg transition-colors">
            {b.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

const EMPTY = { title_en: "", title_bm: "", slug: "", body_en: "", body_bm: "", cover_image_url: "", is_published: false };

export default function AdminBlogPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { blogApi.list({ limit: 100 }).then((r) => setPosts(r.data)).finally(() => setLoading(false)); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); onOpen(); };
  const openEdit = (p: any) => { setEditing(p); setForm({ ...p }); onOpen(); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await blogApi.update(editing.id, form);
        setPosts(p => p.map(x => x.id === editing.id ? data : x));
        toast.success("Post updated");
      } else {
        const { data } = await blogApi.create(form);
        setPosts(p => [data, ...p]);
        toast.success("Post created");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground">Blog Posts</h1>
        <Button color="primary" startContent={<Plus size={16} />} onPress={openAdd} className="font-bold">Add Post</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner color="primary" /></div> : (
        <Table aria-label="Blog" className="bg-content1">
          <TableHeader>
            <TableColumn className="bg-content2 text-foreground/60">TITLE</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">SLUG</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">STATUS</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">PUBLISHED</TableColumn>
            <TableColumn className="bg-content2 text-foreground/60">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<p className="text-foreground/30 py-8">No posts yet</p>}>
            {posts.map((post) => (
              <TableRow key={post.id} className="border-b border-[#1a1a1a]">
                <TableCell className="text-foreground font-medium">{post.title_en}</TableCell>
                <TableCell className="text-foreground/40 text-sm font-mono">{post.slug}</TableCell>
                <TableCell><Chip size="sm" color={post.is_published ? "success" : "default"} variant="flat">{post.is_published ? "Published" : "Draft"}</Chip></TableCell>
                <TableCell className="text-foreground/40 text-sm">{post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light" className="text-foreground/40 hover:text-primary" onPress={() => openEdit(post)}><Edit2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl" className="bg-content2 border border-divider" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="text-foreground">{editing ? "Edit Post" : "New Post"}</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Title (EN)" variant="bordered" value={form.title_en} onChange={(e) => setForm((f: any) => ({ ...f, title_en: e.target.value }))} />
              <Input label="Title (BM)" variant="bordered" value={form.title_bm} onChange={(e) => setForm((f: any) => ({ ...f, title_bm: e.target.value }))} />
              <Input label="Slug" variant="bordered" value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} />
              <Input label="Cover Image URL" variant="bordered" value={form.cover_image_url} onChange={(e) => setForm((f: any) => ({ ...f, cover_image_url: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch isSelected={form.is_published} onValueChange={(v) => setForm((f: any) => ({ ...f, is_published: v }))} color="primary" />
              <span className="text-foreground/60 text-sm">Publish immediately</span>
            </div>
            <Tabs color="primary">
              <Tab key="en" title="Content (EN)">
                <div className="mt-3"><TiptapEditor value={form.body_en} onChange={(v) => setForm((f: any) => ({ ...f, body_en: v }))} /></div>
              </Tab>
              <Tab key="bm" title="Content (BM)">
                <div className="mt-3"><TiptapEditor value={form.body_bm} onChange={(v) => setForm((f: any) => ({ ...f, body_bm: v }))} /></div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" isLoading={saving} onPress={handleSave}>Save Post</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
