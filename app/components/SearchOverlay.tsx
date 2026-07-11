"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface SearchProduct {
  name: string;
  price: string;
  image: string;
  href: string;
}

const allProducts: SearchProduct[] = [
  { name: "XIICLUSIVE", price: "$5.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/39B70675-C860-42EE-B86A-49EB32A15FD82_05b407d0-8bcb-4747-8507-d6cbf07798fb.jpg?v=1765430371", href: "/" },
  { name: "XII00 CROP TOP", price: "$30.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-top-white-front-680ea8a4e6c90.png?v=1745791153", href: "/" },
  { name: "YGR CROP HOODIE", price: "$46.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/womens-cropped-hoodie-black-front-680ea98c6e13d.png?v=1745791384", href: "/" },
  { name: "DGO JERSEY LONG SLEEVE", price: "$45.50", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-recycled-hockey-fan-jersey-white-front-680ea9d6dd391.png?v=1745791464", href: "/" },
  { name: "YGR HOODIE", price: "$34.50", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/unisex-heavy-blend-hoodie-black-front-680eab90098bb.png?v=1745791903", href: "/" },
  { name: "YGR SWEATPANTS", price: "$57.95", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/unisex-fleece-sweatpants-black-front-680eac50c5237.png?v=1745792088", href: "/" },
  { name: "XII00 TAPE CROP TOP", price: "$30.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-top-white-front-680ead114a6b7.png?v=1745792283", href: "/" },
  { name: "XIIVIXEN CROP TEE", price: "$33.50", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-tee-white-front-680ead49acba0.png?v=1745792340", href: "/" },
  { name: "DGO JERSEY SHORT SLEEVE", price: "$43.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-recycled-unisex-sports-jersey-white-front-680eade8b0a2a.png?v=1745792503", href: "/" },
  { name: "METAL PRINT WHITE GIRL", price: "$63.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/glossy-metal-print-_in_-white-12x12-front-69ed6e167ebe6.png?v=1777167900", href: "/" },
  { name: "METAL PRINT BLACK GIRL", price: "$63.00", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/glossy-metal-print-_in_-white-12x12-front-69ed6e373e380.png?v=1777167932", href: "/" },
  { name: "OSITA ALTERNATE COVER POSTER", price: "$29.50", image: "https://cdn.shopify.com/s/files/1/0634/0706/3123/files/enhanced-matte-paper-poster-_cm_-a1-_59.4x84.1-cm_-front-69575c9ae40d5.png?v=1767333023", href: "/" },
];

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) close();
  };

  const filtered = query.trim()
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : allProducts;

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={open}
        className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-6 [&_svg]:h-6"
        aria-label="Search"
      >
        <svg viewBox="0 0 256 256" fill="currentColor">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-[12px] flex flex-col items-center pt-24 px-4"
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-6 right-6 text-white p-2 transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-6 [&_svg]:h-6"
            aria-label="Close search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Search input */}
          <div className="w-full max-w-[600px] flex flex-col items-center gap-6">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full bg-transparent border-0 border-b border-white/30 text-white text-center text-lg md:text-2xl font-sans uppercase tracking-tight outline-none py-3 transition-colors duration-200 focus:border-white placeholder:text-white/30"
            />

            {/* Results */}
            <div className="w-full max-h-[60vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-white/50 uppercase tracking-tight py-8">
                  No results found
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
                  {filtered.map((product, index) => (
                    <Link
                      key={index}
                      href={product.href}
                      onClick={close}
                      className="group flex flex-col gap-2 no-underline"
                    >
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover block transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="text-center py-1">
                        <div className="text-xs md:text-sm font-medium uppercase tracking-tight text-white leading-normal">
                          {product.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-white/50 leading-normal mt-0.5">
                          {product.price}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
