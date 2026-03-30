"use client";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Chip, Spinner } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/store/ProductCard";
import { productsApi, motorcycleApi, blogApi } from "@/lib/api";

export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8, sort: "newest" }),
      motorcycleApi.brands(),
      blogApi.list({ limit: 3 }),
    ]).then(([pRes, bRes, blogRes]) => {
      setProducts(pRes.data);
      setBrands(bRes.data);
      setPosts(blogRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0d0010] to-[#0A0A0A]" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #D400A8 0%, transparent 60%)" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#D400A8 1px, transparent 1px), linear-gradient(90deg, #D400A8 1px, transparent 1px)", backgroundSize: "50px 50px" }}
        />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
          <Chip color="secondary" variant="flat" size="sm" className="mb-6 font-bold tracking-widest uppercase text-xs">
            Malaysian Performance Exhaust Brand
          </Chip>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none mb-4">
            <span className="block text-white glow-primary">{t("home.tagline")}</span>
            <span className="block brand-gradient">{t("home.tagline2")}</span>
          </h1>

          <p className="text-white/50 text-base md:text-xl mt-6 mb-8 max-w-2xl mx-auto px-2">
            Malaysian Performance Exhaust Brand — PERFORMANCE. MEROKET.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                color="primary"
                size="lg"
                className="font-bold text-base w-full sm:w-auto px-8"
                endContent={<ArrowRight size={18} />}
              >
                {t("home.shopNow")}
              </Button>
            </Link>
            <Link href="/installation" className="w-full sm:w-auto">
              <Button
                color="secondary"
                variant="bordered"
                size="lg"
                className="font-bold text-base w-full sm:w-auto px-8"
              >
                {t("nav.installation")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 sm:gap-12 mt-12 pt-8 border-t border-white/10">
            {[
              { value: "500+", label: "Products" },
              { value: "10K+", label: "Happy Riders" },
              { value: "50+", label: "Bike Models" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-white/40 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4 bg-[#060606]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Performance Engineered", desc: "Maximum power, minimum restriction" },
            { icon: Shield, title: "Quality Guaranteed", desc: "Built to withstand Malaysian roads" },
            { icon: Wrench, title: "Expert Installation", desc: "Professional fitting by certified techs" },
          ].map((f) => (
            <Card key={f.title} className="bg-[#111] border border-[#222] hover:border-[#D400A8]/40 transition-colors">
              <CardBody className="flex flex-row items-start gap-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{f.title}</h3>
                  <p className="text-white/50 text-sm">{f.desc}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="accent-stripe mx-auto mb-4" />
            <h2 className="text-4xl font-black text-white">{t("home.featuredProducts")}</h2>
          </div>

          {loading ? (
            <div className="flex justify-center"><Spinner color="primary" size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/products">
              <Button color="primary" variant="bordered" size="lg" endContent={<ArrowRight size={16} />} className="font-bold">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY BRAND */}
      <section className="py-16 px-4 bg-[#060606]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">{t("home.shopByBrand")}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/products?brand_id=${brand.id}`}>
                <div className="snap-start shrink-0 w-32 h-20 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="text-white font-bold text-sm text-center px-2">{brand.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D400A8]/20 to-[#F5C200]/10 border border-[#D400A8]/30 p-8 md:p-12 text-center">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "radial-gradient(circle, #D400A8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <Chip color="secondary" variant="flat" className="mb-4 font-bold uppercase tracking-widest text-xs">
              {t("home.promoTitle")}
            </Chip>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              10% OFF Your First Order
            </h2>
            <p className="text-white/50 mb-6">Use code <span className="text-secondary font-bold">MUFFLUX10</span> at checkout</p>
            <Link href="/products">
              <Button color="primary" size="lg" className="font-bold">Shop Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST BLOG */}
      {posts.length > 0 && (
        <section className="py-20 px-4 bg-[#060606]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white">{t("home.latestBlog")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="bg-[#111] border border-[#222] hover:border-[#D400A8]/40 transition-colors cursor-pointer">
                    <CardBody className="p-0">
                      {post.cover_image_url && (
                        <div className="relative h-48">
                          <Image src={post.cover_image_url} alt={post.title_en} fill className="object-cover rounded-t-xl" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-white font-bold line-clamp-2">{post.title_en}</h3>
                        <p className="text-white/40 text-sm mt-2 flex items-center gap-1">
                          {t("blog.publishedOn")} {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
