"use client";

import { useState } from "react";
import Link from "next/link";
import type { CartItem, Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import InlineCheckout from "../components/InlineCheckout";

interface ExclusiveClothesCardProps {
  product: Product;
}

// The Exclusive > Clothes grid intentionally has no per-product detail
// page — everything (image toggle, add to cart, quick buy) happens right
// on this card. One per row on every screen size, sized to match a regular
// product tile rather than stretching full-width.
export default function ExclusiveClothesCard({ product }: ExclusiveClothesCardProps) {
  const { addItem } = useCart();
  const [showBack, setShowBack] = useState(false);
  const [added, setAdded] = useState(false);

  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const hasBackImage = Boolean(product.back_image);
  const displayImage = showBack && product.back_image ? product.back_image : product.image;

  function toggleBack() {
    if (hasBackImage) setShowBack((prev) => !prev);
  }

  function getCartItem(): CartItem | null {
    if (product.price == null) return null;
    return {
      productId: product.id,
      variantId: product.printful_variant_id ?? null,
      variantLabel: null,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      isDigital: product.is_digital,
      isExclusive: true,
      kind: "product",
    };
  }

  function handleAddToCart() {
    const item = getCartItem();
    if (!item) return;
    addItem(item, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleQuickBuy() {
    // Clicking Quick Buy again while it's already open just closes it.
    if (quickBuyOpen) {
      setQuickBuyOpen(false);
      return;
    }

    if (!getCartItem()) return;

    if (!authChecked) {
      const supabase = createClient();
      const {
        data: { user: loggedInUser },
      } = await supabase.auth.getUser();
      setUser(loggedInUser);
      setAuthChecked(true);
      setAuthLoading(false);
    }

    setOrderPlaced(false);
    setQuickBuyOpen(true);
  }

  const quickBuyItem = quickBuyOpen ? getCartItem() : null;

  return (
    <div className="flex w-full flex-col items-center gap-4 py-10 border-b border-white/10 last:border-b-0">
      <div className="flex w-full max-w-[560px] items-center justify-between gap-4 px-4">
        <button
          onClick={handleAddToCart}
          disabled={product.price == null}
          className="text-[11px] uppercase tracking-tight text-white hover:text-white/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {added ? "Added" : "Add to Cart"}
        </button>

        <div
          role={hasBackImage ? "button" : undefined}
          tabIndex={hasBackImage ? 0 : undefined}
          onClick={toggleBack}
          onMouseEnter={() => hasBackImage && setShowBack(true)}
          onMouseLeave={() => hasBackImage && setShowBack(false)}
          className={`relative w-full max-w-[220px] aspect-[3/4] overflow-hidden bg-black ${
            hasBackImage ? "cursor-pointer" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-contain select-none"
            draggable={false}
          />
        </div>

        <Link
          href="/cart?scope=exclusive"
          className="text-[11px] uppercase tracking-tight text-white hover:text-white/70 transition-colors no-underline"
        >
          View Cart
        </Link>
      </div>

      <div className="text-center">
        <div className="text-[11px] font-medium uppercase tracking-tight text-white leading-normal">
          {product.name}
        </div>
        {product.price != null && (
          <div className="text-[11px] text-white leading-normal mt-0.5">
            {formatPrice(product.price)}
          </div>
        )}
      </div>

      {product.external_checkout_url ? (
        <a
          href={product.external_checkout_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-tight text-white hover:text-white/70 transition-colors no-underline"
        >
          Buy Now
        </a>
      ) : (
        <button
          onClick={handleQuickBuy}
          disabled={product.price == null}
          className="text-[11px] uppercase tracking-tight text-white hover:text-white/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Quick Buy
        </button>
      )}

      {quickBuyOpen && (
        <div className="w-full max-w-sm px-4">
          {orderPlaced ? (
            <div className="border border-white/20 p-6 flex flex-col gap-3 items-center text-center">
              <p className="text-sm font-medium text-white">Order placed — thank you!</p>
              <p className="text-xs text-white/60">
                Your order is being processed. A confirmation will be sent to your email.
              </p>
              <button
                onClick={() => setQuickBuyOpen(false)}
                className="text-xs uppercase tracking-tight text-white/50 hover:text-white transition-colors underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : authLoading ? (
            <div className="border border-white/20 p-6 flex items-center justify-center">
              <p className="text-sm text-white/50">Loading...</p>
            </div>
          ) : !user ? (
            <div className="border border-white/20 p-6 flex flex-col gap-3">
              <p className="text-sm text-white text-center uppercase tracking-tight">
                Please log in to quick buy
              </p>
              <Link
                href="/signup"
                className="w-full px-8 py-3 text-xs uppercase tracking-tight font-medium text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] active:scale-95 text-center no-underline"
              >
                CREATE ACCOUNT
              </Link>
              <Link
                href="/signup"
                className="text-center text-xs uppercase tracking-tight text-white/50 hover:text-white transition-colors no-underline"
              >
                Already have an account? Log in
              </Link>
            </div>
          ) : quickBuyItem ? (
            <InlineCheckout
              items={[quickBuyItem]}
              submitLabel="BUY NOW"
              onSuccess={() => setOrderPlaced(true)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
