"use client";
import { Button } from "@heroui/react";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { t } = useTranslation();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const { language } = useUIStore();

  const handleAddToCart = (product: any) => {
    const name = language === "bm" ? product.name_bm : product.name_en;
    const img = product.images?.find((i: any) => i.is_primary) || product.images?.[0];
    addToCart({ productId: product.id, productSlug: product.slug, name, image: img?.image_url || "", qty: 1, price: Number(product.price) });
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-foreground mb-6">{t("account.myWishlist")}</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="text-white/10 mx-auto mb-4" />
          <p className="text-foreground/40 mb-4">{t("account.noWishlist")}</p>
          <Link href="/products"><Button color="primary">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((product) => {
            const name = language === "bm" ? product.name_bm : product.name_en;
            const img = product.images?.find((i: any) => i.is_primary) || product.images?.[0];
            return (
              <div key={product.id} className="bg-content1 border border-divider rounded-2xl overflow-hidden hover:border-primary/40 transition-colors">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-content1 relative">
                    {img ? <Image src={img.image_url} alt={name} fill className="object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-foreground/20 font-black">MFX</span></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-foreground font-semibold text-sm line-clamp-2">{name}</p>
                    <p className="text-primary font-bold mt-1">RM{Number(product.price).toFixed(2)}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3 flex gap-2">
                  <Button size="sm" color="primary" className="flex-1 font-bold" startContent={<ShoppingCart size={12} />}
                    onPress={() => handleAddToCart(product)}>{t("product.addToCart")}</Button>
                  <Button size="sm" variant="bordered" className="border-danger/30 text-danger" isIconOnly
                    onPress={() => removeItem(product.id)}><Heart size={12} fill="currentColor" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
