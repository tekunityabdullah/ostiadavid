"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

const CART_STORAGE_KEY = "osita-cart";

// A cart line is uniquely identified by product + variant, so two sizes of
// the same product are separate lines instead of merging quantities.
function lineKey(productId: string, variantId?: number | null) {
  return variantId ? `${productId}:${variantId}` : productId;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: number | null) => void;
  updateQuantity: (productId: string, variantId: number | null | undefined, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      hydratedRef.current = true;
      setItems(loadCart());
    });
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(item.productId, item.variantId);
        const existing = prev.find((i) => lineKey(i.productId, i.variantId) === key);
        if (existing) {
          return prev.map((i) =>
            lineKey(i.productId, i.variantId) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: number | null) => {
    const key = lineKey(productId, variantId);
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.variantId) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: number | null | undefined, quantity: number) => {
      if (quantity < 1) return;
      const key = lineKey(productId, variantId);
      setItems((prev) =>
        prev.map((i) => (lineKey(i.productId, i.variantId) === key ? { ...i, quantity } : i))
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
