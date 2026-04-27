"use client";
import { useEffect, useState } from "react";
import { Button, Spinner, Chip } from "@heroui/react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useUIStore } from "@/store/uiStore";
import { blogApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import i18n from "@/lib/i18n";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useUIStore();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.get(params.slug).then((r) => setPost(r.data)).catch(() => router.push("/blog")).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="flex justify-center py-40"><Spinner color="primary" size="lg" /></div>;
  if (!post) return null;

  const title = language === "bm" ? post.title_bm : post.title_en;
  const body = language === "bm" ? post.body_bm : post.body_en;

  const toggleLang = () => {
    const next = language === "en" ? "bm" : "en";
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/blog">
          <Button isIconOnly variant="light" size="sm" className="text-foreground/50"><ArrowLeft size={18} /></Button>
        </Link>
        <Button size="sm" variant="bordered" className="border-divider text-foreground/60 ml-auto" onPress={toggleLang}>
          {language === "en" ? "🇲🇾 BM" : "🇬🇧 EN"}
        </Button>
        <Button size="sm" variant="light" className="text-foreground/50" startContent={<Share2 size={14} />} onPress={handleShare}>
          {t("blog.share")}
        </Button>
      </div>

      {post.cover_image_url && (
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
          <Image src={post.cover_image_url} alt={title} fill className="object-cover" />
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">{title}</h1>

      <div className="flex items-center gap-3 mb-8">
        <Chip size="sm" color="primary" variant="flat">Blog</Chip>
        <span className="text-foreground/40 text-sm">
          {t("blog.publishedOn")} {post.published_at ? new Date(post.published_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) : "—"}
        </span>
      </div>

      <div
        className="text-foreground/70 leading-relaxed prose prose-invert max-w-none
          prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: body || "<p>No content available.</p>" }}
      />
    </div>
  );
}
