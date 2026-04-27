"use client";
import { useState } from "react";
import { Button, Input, RadioGroup, Radio, Select, SelectItem, Divider, Chip } from "@heroui/react";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { ordersApi, paymentsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = ["step1", "step2", "step3"] as const;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, discountCode, discountAmount, loyaltyPointsUsed, clearCart } = useCartStore();
  const { user } = useUserStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [shippingType, setShippingType] = useState("delivery");
  const [courier, setCourier] = useState("poslaju");
  const [address, setAddress] = useState({ name: user?.name || "", phone: user?.phone || "", address_line1: "", city: "", state: "", postcode: "" });
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = shippingType === "delivery" ? 10 : 0;
  const loyaltyDiscount = loyaltyPointsUsed * 0.1;
  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount + shippingFee);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const { data: order } = await ordersApi.create({
        items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId, qty: i.qty })),
        shipping_type: shippingType,
        courier: shippingType === "delivery" ? courier : undefined,
        address: shippingType === "delivery" ? address : undefined,
        discount_code: discountCode || undefined,
        loyalty_points_used: loyaltyPointsUsed,
      });
      setOrderId(order.id);
      setStep(1);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { data } = await paymentsApi.createBillplz(orderId);
      clearCart();
      window.location.href = data.payment_url;
    } catch {
      toast.error(t("errors.paymentFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${i <= step ? "text-primary" : "text-foreground/30"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2
                ${i < step ? "bg-primary border-primary" : i === step ? "border-primary" : "border-divider"}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="hidden sm:block text-sm font-semibold">{t(`checkout.${s}`)}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-16 ${i < step ? "bg-primary" : "bg-divider"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Delivery */}
          {step === 0 && (
            <div className="bg-content1 border border-divider rounded-2xl p-6 space-y-6">
              <h2 className="text-foreground font-bold text-xl">{t("checkout.step1")}</h2>

              <RadioGroup label="Shipping Type" value={shippingType} onValueChange={setShippingType} color="primary">
                <Radio value="delivery">{t("checkout.delivery")}</Radio>
                <Radio value="pickup">{t("checkout.selfPickup")}</Radio>
                <Radio value="installation">{t("checkout.installation")}</Radio>
              </RadioGroup>

              {shippingType === "delivery" && (
                <div className="space-y-4">
                  <h3 className="text-foreground/70 font-semibold text-sm">{t("checkout.shippingAddress")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label={t("account.name")} variant="bordered" value={address.name} onChange={(e) => setAddress(a => ({ ...a, name: e.target.value }))} />
                    <Input label={t("account.phone")} variant="bordered" value={address.phone} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} />
                    <Input label="Address" variant="bordered" className="sm:col-span-2" value={address.address_line1} onChange={(e) => setAddress(a => ({ ...a, address_line1: e.target.value }))} />
                    <Input label="City" variant="bordered" value={address.city} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} />
                    <Input label="State" variant="bordered" value={address.state} onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))} />
                    <Input label="Postcode" variant="bordered" value={address.postcode} onChange={(e) => setAddress(a => ({ ...a, postcode: e.target.value }))} />
                  </div>

                  <div>
                    <h3 className="text-foreground/70 font-semibold text-sm mb-3">{t("checkout.selectCourier")}</h3>
                    <RadioGroup value={courier} onValueChange={setCourier} color="primary" orientation="horizontal">
                      <Radio value="poslaju">{t("checkout.poslaju")} — RM10</Radio>
                      <Radio value="jnt">{t("checkout.jnt")} — RM8</Radio>
                      <Radio value="dhl">{t("checkout.dhl")} — RM15</Radio>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {shippingType === "installation" && (
                <div className="space-y-4">
                  <h3 className="text-foreground/70 font-semibold text-sm">{t("checkout.bookingSlot")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" label={t("checkout.preferredDate")} variant="bordered" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                    <Input type="time" label={t("checkout.preferredTime")} variant="bordered" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                  </div>
                </div>
              )}

              <Button color="primary" size="lg" className="w-full font-bold" endContent={<ArrowRight size={16} />}
                isLoading={loading} onPress={placeOrder}>
                {t("checkout.placeOrder")}
              </Button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-content1 border border-divider rounded-2xl p-6 space-y-6">
              <h2 className="text-foreground font-bold text-xl">{t("checkout.step2")}</h2>
              <div className="flex items-center gap-3 p-4 border border-[#D400A8]/30 rounded-xl bg-[#D400A8]/5">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-black text-sm">BP</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Billplz</p>
                  <p className="text-foreground/40 text-sm">FPX / Credit Card / GrabPay / TNG eWallet</p>
                </div>
              </div>
              <p className="text-foreground/50 text-sm">Order #{orderId} — Total: <span className="text-primary font-bold">RM{total.toFixed(2)}</span></p>
              <div className="flex gap-3">
                <Button variant="bordered" className="border-divider text-foreground/60" onPress={() => setStep(0)} startContent={<ArrowLeft size={16} />}>
                  {t("checkout.back")}
                </Button>
                <Button color="primary" size="lg" className="flex-1 font-bold" isLoading={loading} onPress={proceedToPayment}>
                  {t("checkout.payWithBillplz")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="bg-content1 border border-divider rounded-2xl p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">{t("checkout.orderConfirmed")}</h2>
                <p className="text-foreground/50 mt-2">{t("checkout.orderNumber")}: #{orderId}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href={`/account/orders`}>
                  <Button color="primary" className="font-bold">{t("checkout.trackOrder")}</Button>
                </Link>
                <Link href="/products">
                  <Button variant="bordered" className="border-divider text-foreground/60">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-content1 border border-divider rounded-2xl p-5 space-y-4 sticky top-24">
            <h3 className="text-foreground font-bold">{t("checkout.orderSummary")}</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="w-10 h-10 bg-content1 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-medium line-clamp-1">{item.name}</p>
                    {item.variantName && <p className="text-foreground/40 text-xs">{item.variantName}</p>}
                  </div>
                  <p className="text-foreground text-xs whitespace-nowrap">×{item.qty}</p>
                  <p className="text-primary text-xs font-bold whitespace-nowrap">RM{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Divider className="bg-divider" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground/50">Subtotal</span><span className="text-foreground">RM{subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between"><span className="text-foreground/50">Discount</span><span className="text-success">-RM{discountAmount.toFixed(2)}</span></div>}
              {loyaltyDiscount > 0 && <div className="flex justify-between"><span className="text-foreground/50">Loyalty</span><span className="text-success">-RM{loyaltyDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-foreground/50">Shipping</span><span className="text-foreground">RM{shippingFee.toFixed(2)}</span></div>
            </div>
            <Divider className="bg-divider" />
            <div className="flex justify-between">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-primary font-black">RM{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
