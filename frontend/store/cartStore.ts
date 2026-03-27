import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  variantId?: number;
  productSlug: string;
  name: string;
  image: string;
  variantName?: string;
  qty: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;
  loyaltyPointsUsed: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQty: (productId: number, variantId: number | undefined, qty: number) => void;
  clearCart: () => void;
  setDiscountCode: (code: string | null, amount: number) => void;
  setLoyaltyPoints: (points: number) => void;
  totalAmount: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,
      discountAmount: 0,
      loyaltyPointsUsed: 0,

      addItem: (item) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (idx >= 0) {
            const updated = [...state.items];
            updated[idx].qty += item.qty;
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      updateQty: (productId, variantId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, qty } : i
          ),
        })),

      clearCart: () => set({ items: [], discountCode: null, discountAmount: 0, loyaltyPointsUsed: 0 }),

      setDiscountCode: (code, amount) => set({ discountCode: code, discountAmount: amount }),

      setLoyaltyPoints: (points) => set({ loyaltyPointsUsed: points }),

      totalAmount: () => {
        const { items, discountAmount, loyaltyPointsUsed } = get();
        const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        const loyaltyDiscount = loyaltyPointsUsed * 0.1;
        return Math.max(0, subtotal - discountAmount - loyaltyDiscount);
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "mufflux-cart" }
  )
);
