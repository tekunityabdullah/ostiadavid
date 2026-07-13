"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const TRANSITION_MS = 200;

export default function SearchOverlay() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setQuery("");
    setActiveIndex(0);
    setIsMounted(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      setQuery("");
    }, TRANSITION_MS);
  }, []);

  // Mount with closed styles first, then flip to visible on the next frame
  // so the CSS transition actually animates instead of snapping open.
  useEffect(() => {
    if (!isMounted) return;
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => inputRef.current?.focus(), TRANSITION_MS);
    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      triggerRef.current?.focus();
    }
  }, [isMounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) close();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allProducts.filter((p) => p.name.toLowerCase().includes(q)) : allProducts;
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const product = filtered[activeIndex];
      if (product) {
        close();
        router.push(product.href);
      }
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={open}
        className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
        aria-label="Search"
      >
        <svg viewBox="0 0 256 256" fill="currentColor">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
        </svg>
      </button>

      {/* Overlay */}
      {isMounted && (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className={`fixed inset-0 z-[200] flex justify-center px-4 pt-[max(5vh,24px)] sm:pt-[12vh] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Command palette panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className={`w-full max-w-[560px] h-fit max-h-[76vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden transition-all duration-200 ease-out ${
              isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.97] -translate-y-2"
            }`}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10 shrink-0">
              <svg viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4 text-white/40 shrink-0">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="SEARCH PRODUCTS..."
                aria-label="Search products"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent border-0 text-white text-sm font-sans uppercase tracking-tight outline-none placeholder:text-white/30"
              />
              <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] text-white/40 border border-white/15 rounded px-1.5 py-0.5 uppercase tracking-tight shrink-0">
                Esc
              </kbd>
              <button
                onClick={close}
                className="sm:hidden text-white/60 p-1 transition-opacity duration-200 hover:opacity-70 active:scale-95 shrink-0 [&_svg]:w-4 [&_svg]:h-4"
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
            </div>

            {/* Results */}
            <div ref={listRef} className="overflow-y-auto px-2 py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-white/40 uppercase tracking-tight py-10">
                  No results found
                </p>
              ) : (
                filtered.map((product, index) => (
                  <Link
                    key={index}
                    href={product.href}
                    data-index={index}
                    onClick={close}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg no-underline transition-colors ${
                      activeIndex === index ? "bg-white/10" : ""
                    }`}
                  >
                    <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-md bg-black border border-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                    <span className="flex-1 min-w-0 truncate text-xs font-medium uppercase tracking-tight text-white">
                      {product.name}
                    </span>
                    <span className="shrink-0 text-xs text-white/40">
                      {product.price}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
