"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import SubNav from "../../components/SubNav";
import Footer from "../../components/Footer";
import InlineCheckout from "../../components/InlineCheckout";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, Product } from "@/lib/types";
import type { NormalizedVariant } from "@/lib/printful";

interface ProductDetailProps {
  product: Product;
}

function parseVariants(raw: string | null | undefined): NormalizedVariant[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [variantError, setVariantError] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  const variants = useMemo(() => parseVariants(product.printful_variants), [product.printful_variants]);
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find(
        (v) =>
          (!sizes.length || v.size === selectedSize) &&
          (!colors.length || v.color === selectedColor)
      ) ?? null
    );
  }, [variants, sizes, colors, selectedSize, selectedColor]);


  const displayPrice = selectedVariant?.price ?? product.price;
  const displayImage = product.image || selectedVariant?.image;

  function getCartItem(): CartItem | null {
    if (variants.length && !selectedVariant) return null;

    const variantLabel = selectedVariant
      ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" / ")
      : null;

    return {
      productId: product.id,
      variantId: selectedVariant?.syncVariantId ?? null,
      variantLabel,
      name: product.name,
      price: displayPrice,
      image: displayImage ?? "",
      quantity: product.is_digital ? 1 : quantity,
      isDigital: product.is_digital,
    };
  }

  function handleAddToCart() {
    const item = getCartItem();
    if (!item) {
      setVariantError(true);
      return;
    }
    setVariantError(false);

    addItem(item, item.quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleQuickBuy() {
    const item = getCartItem();
    if (!item) {
      setVariantError(true);
      return;
    }
    setVariantError(false);
    setOrderPlaced(false);
    setQuickBuyOpen(true);
  }

  const quickBuyItem = quickBuyOpen ? getCartItem() : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-4 md:px-[60px] pt-6 pb-12 w-full">
          <div className="w-full max-w-[200px] mx-auto lg:max-w-none lg:w-1/2 aspect-[3/4] max-h-[600px] overflow-hidden bg-black">
            <img
  src={displayImage ?? ""}
  alt={product.name}
  className="w-full h-full object-contain"
/>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left gap-6">
            {product.is_exclusive && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                Exclusive Drop
              </span>
            )}
            {product.is_digital && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                Digital Download
              </span>
            )}
            <h1 className="text-lg md:text-2xl font-medium uppercase tracking-wide">
              {product.name}
            </h1>
            <p className="text-base font-medium">{formatPrice(displayPrice)}</p>

            {colors.length > 0 && (
              <div className="flex flex-col items-center lg:items-start gap-2">
                <span className="text-xs uppercase tracking-tight text-white">
                  Color{colors.length > 1 ? "" : `: ${colors[0]}`}
                </span>
                {colors.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-xs uppercase tracking-tight border transition-colors ${
                          selectedColor === color
                            ? "border-white bg-white text-black"
                            : "border-white/20 text-white hover:border-white/50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="flex flex-col items-center lg:items-start gap-2">
                <span className="text-xs uppercase tracking-tight text-white">Size</span>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {sizes.map((size) => {
                    const optionAvailable = variants.some(
                      (v) =>
                        v.size === size &&
                        (!colors.length || v.color === selectedColor) &&
                        v.available
                    );
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!optionAvailable}
                       className="px-4 py-2 text-xs uppercase tracking-tight text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {variantError && (
              <p className="text-xs text-red-300">Please select a size before continuing.</p>
            )}

            {selectedVariant && !selectedVariant.available && (
              <p className="text-xs text-red-300">This option is currently out of stock.</p>
            )}

           {!product.is_digital && (
             <div className="flex justify-center mt-4">
  <div className="flex items-center border border-white/20">
    <button
      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      className="px-4 py-2 text-white hover:bg-white/10 transition-colors"
      aria-label="Decrease quantity"
    >
      -
    </button>

    <span className="px-4 py-2 text-sm min-w-[3rem] text-center">
      {quantity}
    </span>

    <button
      onClick={() => setQuantity((q) => q + 1)}
      className="px-4 py-2 text-white hover:bg-white/10 transition-colors"
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>
</div>
           )}

            <div className="w-full flex flex-col sm:flex-row gap-3 max-w-sm">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant ? !selectedVariant.available : false}
                className="flex-1 px-8 py-3 text-xs uppercase tracking-tight font-medium text-white border-none cursor-pointer transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {added ? "Added to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleQuickBuy}
                disabled={selectedVariant ? !selectedVariant.available : false}
                className="flex-1 px-8 py-3 text-xs uppercase tracking-tight font-medium text-white bg-transparent cursor-pointer disabled:cursor-not-allowed"
              >
                Quick Buy
              </button>
            </div>

            {quickBuyOpen && (
              <div className="w-full max-w-sm mt-2">
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

            <button
              onClick={() => router.push("/cart")}
              className="self-start text-xs uppercase tracking-tight text-white hover:text-white/70 transition-colors text-left"
            >
              View Cart
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}