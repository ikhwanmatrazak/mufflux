"use client";
import { useState } from "react";
import { Button, Input, Switch, Divider, Image, Chip } from "@heroui/react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { discountApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQty, discountCode, discountAmount, loyaltyPointsUsed, setDiscountCode, setLoyaltyPoints, totalAmount } = useCartStore();
  const { user } = useUserStore();
  const [codeInput, setCodeInput] = useState("");
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [validating, setValidating] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = items.length > 0 ? 10 : 0;
  const loyaltyDiscount = loyaltyPointsUsed * 0.1;
  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount + shippingFee);

  const handleApplyCode = async () => {
    setValidating(true);
    try {
      const { data } = await discountApi.validate({ code: codeInput, order_subtotal: subtotal });
      setDiscountCode(data.code, Number(data.discount_amount));
      toast.success(`Discount applied: -RM${Number(data.discount_amount).toFixed(2)}`);
    } catch {
      toast.error(t("errors.codeNotFound"));
    } finally {
      setValidating(false);
    }
  };

  const handleLoyaltyToggle = (val: boolean) => {
    setUseLoyalty(val);
    if (val && user) {
      const maxPoints = Math.min(user.loyalty_points, Math.floor(subtotal / 0.1));
      setLoyaltyPoints(maxPoints);
    } else {
      setLoyaltyPoints(0);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="text-white/10 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("cart.emptyCart")}</h2>
        <p className="text-foreground/40 mb-8">{t("cart.emptyCartDesc")}</p>
        <Link href="/products">
          <Button color="primary" size="lg" className="font-bold">{t("cart.continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-foreground mb-8">{t("cart.yourCart")}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 bg-content1 border border-divider rounded-2xl p-4 items-center">
              <div className="w-20 h-20 bg-content1 rounded-xl overflow-hidden shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} className="w-full h-full object-cover" removeWrapper />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-foreground/20 text-xs font-black">MFX</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-foreground font-semibold text-sm line-clamp-1">{item.name}</h3>
                {item.variantName && <p className="text-foreground/40 text-xs mt-0.5">{item.variantName}</p>}
                <p className="text-primary font-bold mt-1">RM{item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button isIconOnly size="sm" variant="flat" onPress={() => updateQty(item.productId, item.variantId, Math.max(1, item.qty - 1))}>
                  <Minus size={12} />
                </Button>
                <span className="text-foreground font-bold w-6 text-center text-sm">{item.qty}</span>
                <Button isIconOnly size="sm" variant="flat" onPress={() => updateQty(item.productId, item.variantId, item.qty + 1)}>
                  <Plus size={12} />
                </Button>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="text-foreground font-bold">RM{(item.price * item.qty).toFixed(2)}</p>
              </div>

              <Button isIconOnly size="sm" variant="light" className="text-danger/60 hover:text-danger"
                onPress={() => removeItem(item.productId, item.variantId)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-content1 border border-divider rounded-2xl p-6 space-y-5 sticky top-24">
            <h2 className="text-foreground font-bold text-lg">Order Summary</h2>

            {/* Discount Code */}
            <div>
              <p className="text-foreground/60 text-sm mb-2">{t("cart.discountCode")}</p>
              <div className="flex gap-2">
                <Input size="sm" placeholder="Enter code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
                  className="flex-1" variant="bordered" />
                <Button size="sm" color="primary" isLoading={validating} onPress={handleApplyCode}>
                  {t("cart.applyCode")}
                </Button>
              </div>
              {discountCode && (
                <Chip size="sm" color="success" variant="flat" className="mt-2">
                  Code: {discountCode} (-RM{discountAmount.toFixed(2)})
                </Chip>
              )}
            </div>

            {/* Loyalty Points */}
            {user && user.loyalty_points > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm">{t("cart.loyaltyPoints")}</p>
                  <p className="text-foreground/40 text-xs">
                    {t("cart.availablePoints", { points: user.loyalty_points, amount: (user.loyalty_points * 0.1).toFixed(2) })}
                  </p>
                </div>
                <Switch isSelected={useLoyalty} onValueChange={handleLoyaltyToggle} color="primary" size="sm" />
              </div>
            )}

            <Divider className="bg-divider" />

            {/* Totals */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">{t("cart.subtotal")}</span>
                <span className="text-foreground">RM{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">{t("cart.discount")}</span>
                  <span className="text-success">-RM{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">{t("cart.loyaltyDiscount")}</span>
                  <span className="text-success">-RM{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">{t("cart.shipping")}</span>
                <span className="text-foreground">RM{shippingFee.toFixed(2)}</span>
              </div>
            </div>

            <Divider className="bg-divider" />

            <div className="flex justify-between">
              <span className="text-foreground font-bold">{t("cart.total")}</span>
              <span className="text-primary font-black text-xl">RM{total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="block">
              <Button color="primary" size="lg" className="w-full font-bold" endContent={<ArrowRight size={16} />}>
                {t("cart.proceedToCheckout")}
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="bordered" size="sm" className="w-full text-foreground/50 border-divider">
                {t("cart.continueShopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
