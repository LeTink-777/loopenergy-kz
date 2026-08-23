import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  flavor?: string;
  /** Human-readable variant labels, kept so the cart reads right after a reload. */
  flavorLabel?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, flavor?: string) => void;
  updateQuantity: (productId: string, quantity: number, flavor?: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

/** A product bought in two flavours is two cart lines, so identity includes the flavour. */
const sameLine = (a: Pick<CartItem, 'productId' | 'flavor'>, productId: string, flavor?: string) =>
  a.productId === productId && a.flavor === flavor;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const quantity = item.quantity ?? 1;
          const existing = state.items.find((i) => sameLine(i, item.productId, item.flavor));

          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.flavor)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (productId, flavor) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, flavor)),
        })),

      updateQuantity: (productId, quantity, flavor) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameLine(i, productId, flavor))
              : state.items.map((i) =>
                  sameLine(i, productId, flavor) ? { ...i, quantity } : i,
                ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'loop-energy-cart' },
  ),
);
