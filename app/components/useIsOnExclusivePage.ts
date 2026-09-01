"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Shared by Header's search/account/cart icons — deliberately pathname-only
// (no useSearchParams) for everything except /cart, since useSearchParams
// would force a Suspense boundary everywhere Header renders, including
// statically-generated pages. /exclusive/* and /unreleased/* (track/video/
// image detail pages, albums, playlists — exclusive-only content living
// outside the /exclusive prefix) are exclusive by path alone.
//
// /cart is the one exception: it's shared by both sides, distinguished only
// by ?scope=exclusive. While actually looking at the Exclusive cart, the
// header's search/account/cart icons should keep behaving as "in exclusive"
// too, not fall back to regular-site behavior just because the path is
// /cart — so this reads the query string directly (not via useSearchParams)
// whenever the pathname changes or the URL changes under us (back/forward).
export function useIsOnExclusivePage() {
  const pathname = usePathname();
  const [cartIsExclusive, setCartIsExclusive] = useState(false);

  useEffect(() => {
    const check = () => {
      setCartIsExclusive(
        typeof window !== "undefined" && window.location.search.includes("scope=exclusive")
      );
    };
    check();
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, [pathname]);

  const isExclusivePath =
    pathname?.startsWith("/exclusive") || pathname?.startsWith("/unreleased") || false;

  return isExclusivePath || (pathname === "/cart" && cartIsExclusive);
}
