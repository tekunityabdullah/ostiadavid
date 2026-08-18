"use client";

import { useState } from "react";
import Link from "next/link";

interface SubNavProps {
  activePage?: "exclusive" | "unreleased" | "tour" | "collections";
}

export default function SubNav({ activePage }: SubNavProps) {
  const [openCollections, setOpenCollections] = useState(false);

  return (
    <div className="fixed top-[56px] sm:top-[68px] left-0 w-full z-[90] bg-black flex justify-center py-3 sm:py-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <nav className="flex w-full max-w-[1400px] justify-between gap-6 px-8 py-3 items-center text-[11px] whitespace-nowrap sm:justify-center sm:gap-10 sm:px-10 md:gap-14 md:px-[60px] lg:gap-20">

        {/* EXCLUSIVE */}
        <Link href="/exclusive" className="uppercase tracking-tight font-medium text-white hover:opacity-70 transition">
          EXCLUSIVE
        </Link>

        {/* TOUR */}
        <Link href="/tour" className="uppercase tracking-tight font-medium text-white hover:opacity-70 transition">
          TOUR
        </Link>

        {/* COLLECTIONS DROPDOWN */}
        <div
          className="relative"
          onMouseEnter={() => setOpenCollections(true)}
          onMouseLeave={() => setOpenCollections(false)}
        >
          <button className="uppercase tracking-tight font-medium text-white hover:opacity-70 transition">
            COLLECTIONS ▾
          </button>

          {openCollections && (
            <div className="absolute top-4 left-0 bg-black border border-white/10 min-w-[180px] flex flex-col text-[11px]">
              <Link
                href="/collections"
                className="px-4 py-2 hover:bg-white/10 uppercase"
              >
                SELF TITLED
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}