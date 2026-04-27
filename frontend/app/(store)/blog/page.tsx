"use client";
import { useEffect, useState } from "react";
import { Spinner, Card, CardBody } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useUIStore } from "@/store/uiStore";
import { blogApi } from "@/lib/api";

export default function BlogPage() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { blogApi.list({ limit: 20 }).then((r) => setPosts(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <div className="accent-stripe mx-auto mb-4" />
        <h1 className="text-4xl font-black text-foreground">{t("blog.latestPosts")}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner color="primary" size="lg" /></div>
      ) : posts.length === 0 ? (
        <p className="text-center text-foreground/40 py-20">{t("blog.noPostsYet")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const title = language === "bm" ? post.title_bm : post.title_en;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="bg-content1 border border-divider hover:border-[#D400A8]/40 transition-colors cursor-pointer h-full">
                  <CardBody className="p-0">
                    {post.cover_image_url ? (
                      <div className="relative h-52">
                        <Image src={post.cover_image_url} alt={title} fill className="object-cover rounded-t-xl" />
                      </div>
                    ) : (
                      <div className="h-52 bg-gradient-to-br from-[#D400A8]/10 to-[#F5C200]/5 rounded-t-xl flex items-center justify-center">
                        <span className="text-primary/30 font-black text-4xl">MFX</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="text-foreground font-bold line-clamp-2 mb-2">{title}</h2>
                      <p className="text-foreground/40 text-xs">
                        {t("blog.publishedOn")} {post.published_at ? new Date(post.published_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                      </p>
                      <span className="inline-block mt-3 text-primary text-sm font-semibold">{t("blog.readMore")} →</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
