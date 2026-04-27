"use client";
import { Card, CardBody, CardFooter, Button, Badge, Chip, Tooltip, Skeleton } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name_en: string;
    name_bm: string;
    price: number;
    compare_price?: number;
    stock_qty: number;
    images: { image_url: string; is_primary: boolean }[];
  };
  loading?: boolean;
}

export default function ProductCard({ product, loading }: ProductCardProps) {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (loading) {
    return (
      <Card className="bg-[#111] border border-[#222]">
        <CardBody className="p-0">
          <Skeleton className="aspect-square rounded-t-xl" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </CardBody>
      </Card>
    );
  }

  const name = language === "bm" ? product.name_bm : product.name_en;
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const inWishlist = isInWishlist(product.id);
  const isOnSale = product.compare_price && product.compare_price > product.price;
  const isOutOfStock = product.stock_qty === 0;
  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      name,
      image: primaryImage?.image_url || "",
      qty: 1,
      price: product.price,
    });
    toast.success(`${name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast("Removed from wishlist");
    } else {
      addToWishlist({ ...product, name_en: product.name_en, name_bm: product.name_bm });
      toast.success("Added to wishlist!");
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="product-card bg-[#111] border border-[#222] hover:border-[#D400A8]/50 cursor-pointer">
        <CardBody className="p-0 overflow-hidden">
          <div className="relative aspect-square bg-[#0d0d0d]">
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-foreground/20 text-4xl font-black">MFX</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && <Chip size="sm" color="danger" className="font-bold text-xs">SALE</Chip>}
              {isLowStock && <Chip size="sm" color="warning" className="font-bold text-xs">LOW STOCK</Chip>}
              {isOutOfStock && <Chip size="sm" color="default" className="font-bold text-xs">SOLD OUT</Chip>}
            </div>

            {/* Wishlist */}
            <Tooltip content={inWishlist ? t("product.removeFromWishlist") : t("product.addToWishlist")}>
              <button
                onClick={handleWishlist}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${inWishlist ? "bg-primary text-white" : "bg-black/60 text-foreground/60 hover:text-primary"}`}
              >
                <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </Tooltip>
          </div>

          <div className="p-4">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{name}</h3>

            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={10} className="text-secondary" fill="currentColor" />
              ))}
              <span className="text-foreground/30 text-xs ml-1">(0)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-lg">RM{Number(product.price).toFixed(2)}</span>
              {isOnSale && (
                <span className="text-foreground/30 line-through text-sm">RM{Number(product.compare_price).toFixed(2)}</span>
              )}
            </div>
          </div>
        </CardBody>

        <CardFooter className="pt-0 px-4 pb-4">
          <Button
            color="primary"
            size="sm"
            className="w-full font-bold"
            startContent={<ShoppingCart size={14} />}
            isDisabled={isOutOfStock}
            onPress={handleAddToCart as any}
          >
            {isOutOfStock ? t("product.outOfStock") : t("product.addToCart")}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
