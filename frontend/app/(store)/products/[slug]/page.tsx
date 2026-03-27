"use client";
import { useEffect, useState } from "react";
import { Button, Tabs, Tab, Badge, Chip, Spinner, Image, RadioGroup, Radio, Progress } from "@heroui/react";
import { ShoppingCart, Heart, Wrench, Star, Minus, Plus, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { productsApi, reviewsApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    productsApi.get(params.slug).then((r) => {
      setProduct(r.data);
      if (r.data.variants?.length) setSelectedVariant(r.data.variants[0]);
    }).catch(() => router.push("/products")).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="flex justify-center py-40"><Spinner color="primary" size="lg" /></div>;
  if (!product) return null;

  const name = language === "bm" ? product.name_bm : product.name_en;
  const description = language === "bm" ? product.description_bm : product.description_en;
  const inWishlist = isInWishlist(product.id);

  const price = selectedVariant
    ? Number(product.price) + Number(selectedVariant.price_modifier)
    : Number(product.price);

  const stockQty = selectedVariant ? selectedVariant.stock_qty : product.stock_qty;
  const loyaltyPoints = Math.floor(price / 10);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      productSlug: product.slug,
      name,
      image: product.images?.[0]?.image_url || "",
      variantName: selectedVariant?.variant_name,
      qty,
      price,
    });
    toast.success(`${name} added to cart!`);
  };

  const approvedReviews = product.reviews?.filter((r: any) => r.is_approved) || [];
  const avgRating = approvedReviews.length
    ? approvedReviews.reduce((s: number, r: any) => s + r.rating, 0) / approvedReviews.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-[#111] rounded-2xl overflow-hidden border border-[#222] mb-4">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage].image_url}
                alt={name}
                className="w-full h-full object-cover"
                removeWrapper
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/20 text-6xl font-black">MFX</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                    ${selectedImage === i ? "border-primary" : "border-[#222]"}`}>
                  <Image src={img.image_url} alt="" className="w-full h-full object-cover" removeWrapper />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-white/40 text-sm mb-1">SKU: {product.sku}</p>
            <h1 className="text-3xl font-black text-white leading-tight">{name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(avgRating) ? "text-secondary" : "text-white/20"} fill="currentColor" />
                ))}
              </div>
              <span className="text-white/40 text-sm">({approvedReviews.length} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-primary">RM{price.toFixed(2)}</span>
            {product.compare_price && Number(product.compare_price) > price && (
              <span className="text-white/30 line-through text-xl">RM{Number(product.compare_price).toFixed(2)}</span>
            )}
          </div>

          {/* Loyalty Badge */}
          {loyaltyPoints > 0 && (
            <Chip color="secondary" variant="flat" size="sm" className="font-semibold">
              {t("product.earnPoints", { points: loyaltyPoints })}
            </Chip>
          )}

          {/* Stock Status */}
          <div>
            {stockQty === 0 ? (
              <Chip color="default" variant="flat">{t("product.outOfStock")}</Chip>
            ) : stockQty <= 5 ? (
              <Chip color="warning" variant="flat">{t("product.lowStock")} ({stockQty} left)</Chip>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span className="text-success text-sm font-medium">{t("product.inStock")}</span>
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div>
              <p className="text-white/60 text-sm mb-2">{t("product.variant")}</p>
              <RadioGroup orientation="horizontal" value={selectedVariant?.id?.toString()}
                onValueChange={(v) => setSelectedVariant(product.variants.find((va: any) => va.id.toString() === v))}>
                {product.variants.map((v: any) => (
                  <Radio key={v.id} value={v.id.toString()}
                    classNames={{ base: "border border-[#333] rounded-lg px-4 py-2 hover:border-primary/50 data-[selected=true]:border-primary" }}>
                    <span className="text-white text-sm">{v.variant_name}</span>
                    {v.price_modifier !== 0 && (
                      <span className="text-primary text-xs ml-1">
                        {v.price_modifier > 0 ? "+" : ""}RM{Number(v.price_modifier).toFixed(2)}
                      </span>
                    )}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Qty */}
          <div className="flex items-center gap-4">
            <p className="text-white/60 text-sm">{t("product.qty")}</p>
            <div className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-xl p-1">
              <Button isIconOnly size="sm" variant="flat" onPress={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></Button>
              <span className="text-white font-bold w-8 text-center">{qty}</span>
              <Button isIconOnly size="sm" variant="flat" onPress={() => setQty(Math.min(stockQty, qty + 1))}><Plus size={14} /></Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button color="primary" size="lg" className="flex-1 font-bold" startContent={<ShoppingCart size={18} />}
              isDisabled={stockQty === 0} onPress={handleAddToCart}>
              {t("product.addToCart")}
            </Button>
            <Button variant="bordered" size="lg" className={inWishlist ? "border-primary text-primary" : "border-[#333] text-white/60"}
              isIconOnly onPress={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}>
              <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
            </Button>
          </div>

          <Link href="/installation">
            <Button color="secondary" variant="flat" size="md" className="w-full font-semibold" startContent={<Wrench size={16} />}>
              {t("product.bookInstallation")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs color="primary" className="w-full">
        <Tab key="description" title={t("product.description")}>
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mt-4">
            {description ? (
              <div className="text-white/70 leading-relaxed whitespace-pre-wrap">{description}</div>
            ) : (
              <p className="text-white/30">No description available.</p>
            )}
          </div>
        </Tab>

        <Tab key="fitment" title={t("product.fitment")}>
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mt-4">
            {product.fitments?.length > 0 ? (
              <div className="space-y-3">
                {product.fitments.map((f: any) => (
                  <div key={f.id} className="flex gap-4 py-3 border-b border-[#222] last:border-0">
                    <Chip size="sm" variant="flat" color="primary">Brand ID: {f.brand_id}</Chip>
                    <Chip size="sm" variant="flat" color="secondary">Model ID: {f.model_id}</Chip>
                    {f.engine_size_id && <Chip size="sm" variant="flat">Engine ID: {f.engine_size_id}</Chip>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30">No fitment data available.</p>
            )}
          </div>
        </Tab>

        <Tab key="reviews" title={`${t("product.reviews")} (${approvedReviews.length})`}>
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mt-4 space-y-6">
            {/* Rating Summary */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black text-white">{avgRating.toFixed(1)}</div>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= Math.round(avgRating) ? "text-secondary" : "text-white/20"} fill="currentColor" />)}
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((rating) => {
                  const count = approvedReviews.filter((r: any) => r.rating === rating).length;
                  const pct = approvedReviews.length ? (count / approvedReviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-white/40 text-xs w-4">{rating}</span>
                      <Progress value={pct} color="secondary" size="sm" className="flex-1" />
                      <span className="text-white/30 text-xs w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {approvedReviews.length === 0 ? (
              <p className="text-white/30 text-center py-4">{t("product.noReviews")}</p>
            ) : (
              <div className="space-y-4">
                {approvedReviews.map((r: any) => (
                  <div key={r.id} className="border-b border-[#222] pb-4 last:border-0">
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= r.rating ? "text-secondary" : "text-white/20"} fill="currentColor" />)}
                    </div>
                    <p className="text-white/70 text-sm">{r.comment}</p>
                    <p className="text-white/30 text-xs mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
