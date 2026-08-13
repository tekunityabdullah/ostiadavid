"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const TRANSITION_MS = 200;

export default function SearchOverlay() {
  const router = useRouter();
  // Suspense-safe (pathname only, no useSearchParams — see HeaderActions)
  // — searching from inside Exclusive should only ever search Exclusive
  // content, never the regular site's catalog.
  const isExclusive = usePathname()?.startsWith("/exclusive") ?? false;
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setQuery("");
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
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMounted, close]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Search navigates to a real /search?q=... page (shareable, back/forward
  // works, and a no-results state can still show the full catalog) instead
  // of filtering inline — only runs on submit, not as you type.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    const scopeParam = isExclusive ? "&scope=exclusive" : "";
    router.push(`/search?q=${encodeURIComponent(q)}${scopeParam}`);
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

      {/* Overlay — a solid black bar anchored below the fixed header, sized
          to its own content (not stretched to fill the viewport). Nothing
          dims or blurs the rest of the page behind it. */}
      {isMounted && (
        <div
          ref={overlayRef}
          className={`fixed top-[56px] sm:top-[68px] inset-x-0 z-[95] bg-black transition-opacity duration-200 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={close}
            className="absolute right-4 top-5 sm:right-6 text-white/60 p-1 transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
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

          <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 py-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-full max-w-[600px] items-center gap-3 border border-white/25 bg-black px-4 h-12 transition-colors focus-within:border-white"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent border-0 text-white text-sm font-sans uppercase tracking-tight outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label="Search"
                className="text-white/50 shrink-0 transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-4 [&_svg]:h-4"
              >
                <svg viewBox="0 0 256 256" fill="currentColor">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
