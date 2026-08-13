"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  defaultValue,
  scope,
}: {
  defaultValue: string;
  /** Carries the current exclusive/regular scope forward on a re-search. */
  scope?: "exclusive";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const scopeParam = scope === "exclusive" ? "&scope=exclusive" : "";
    router.push(`/search?q=${encodeURIComponent(q)}${scopeParam}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-10 flex w-full max-w-[600px] items-center gap-3 border border-white/25 bg-black px-4 h-12 transition-colors focus-within:border-white"
    >
      <input
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
  );
}
