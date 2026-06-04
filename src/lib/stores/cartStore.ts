import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/models';

interface CartState {
  items: CartItem[];
  storeId: string | null;
  notes: string;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  setStoreNotes: (notes: string) => void;
  clearCart: () => void;
  clearStore: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      notes: '',

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, item],
            storeId: item.store_id,
          };
        }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.product_id !== productId);
          const storeId = items.length > 0 ? items[0].store_id : null;
          return { items, storeId };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.product_id !== productId)
            : state.items.map((i) =>
                i.product_id === productId ? { ...i, quantity } : i
              ),
        })),

      updateNotes: (productId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId ? { ...i, notes } : i
          ),
        })),

      setStoreNotes: (notes) => set({ notes }),

      clearCart: () => set({ items: [], storeId: null, notes: '' }),

      clearStore: () => set({ items: [], storeId: null, notes: '' }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    }),
    {
      name: 'tofash-cart',
    }
  )
);
