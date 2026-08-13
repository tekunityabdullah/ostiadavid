"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import InlineCheckout from "../components/InlineCheckout";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function CartPageContent() {
  const { items: allItems, updateQuantity, removeItem } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isExclusive = useSearchParams().get("scope") === "exclusive";

  // One shared cart store, but Exclusive and the regular site never show
  // each other's items — same separation as the header's cart badge.
  const items = useMemo(
    () => allItems.filter((i) => Boolean(i.isExclusive) === isExclusive),
    [allItems, isExclusive]
  );
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const requiresShipping = items.some((item) => !item.isDigital);
  const shipping = requiresShipping && subtotal > 0 ? 8.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wide text-white mb-8 text-center">
            {isExclusive ? "Exclusive Cart" : "Cart"}
          </h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 mt-8">
              <p className="text-sm md:text-base text-white/50 uppercase tracking-tight">
                Your cart is empty
              </p>
              <Link
                href={isExclusive ? "/exclusive" : "/"}
                className="px-8 py-2 text-xs uppercase tracking-tight font-medium text-black bg-white no-underline transition-colors duration-200 hover:bg-[#e5e5e5] active:scale-95"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="w-full md:px-[60px] flex flex-col lg:flex-row gap-8">
              <div className="flex-1 flex flex-col gap-6">
                {items.map((item) => (
                  <div
                    key={item.variantId ? `${item.productId}:${item.variantId}` : item.productId}
                    className="flex gap-4 items-center border-b border-white/10 pb-6"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden bg-black">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <div className="text-sm md:text-base uppercase tracking-tight font-medium text-white">
                        {item.name}
                      </div>
                      {item.variantLabel && (
                        <div className="text-xs uppercase tracking-tight text-white/50">
                          {item.variantLabel}
                        </div>
                      )}
                      <div className="text-sm font-medium text-white mt-1">
                        {formatPrice(item.price)}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-1 text-white text-sm hover:bg-white/10 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm text-white min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-1 text-white text-sm hover:bg-white/10 transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-xs uppercase tracking-tight text-white/50 hover:text-white transition-colors underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-white hidden md:block">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full lg:w-[360px] flex-shrink-0">
                {loading ? (
                  <div className="border border-white/20 p-6 flex flex-col items-center justify-center">
                    <p className="text-sm text-white/50">Loading...</p>
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-4">
                    <InlineCheckout
                      items={items}
                      onSuccess={() => {
                        // Only clear the items belonging to this scope —
                        // the other side's cart (regular vs. exclusive)
                        // must survive a checkout on this one.
                        items.forEach((item) => removeItem(item.productId, item.variantId));
                        window.location.href = `/cart${isExclusive ? "?scope=exclusive&" : "?"}success=true`;
                      }}
                    />
                    <Link
                      href={isExclusive ? "/exclusive" : "/"}
                      className="text-center text-xs uppercase tracking-tight text-white/50 hover:text-white transition-colors no-underline"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="border border-white/20 p-6 flex flex-col gap-4">
                    <h2 className="text-sm uppercase tracking-tight font-medium text-white">
                      Order Summary
                    </h2>

                    <div className="flex justify-between text-sm text-white/70">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/70">
                      <span>Shipping</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between text-base font-medium text-white">
                      <span className="uppercase tracking-tight">Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <p className="text-sm text-white/70 text-center uppercase tracking-tight">
                        Please create an account to complete your purchase
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
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageContent />
    </Suspense>
  );
}
