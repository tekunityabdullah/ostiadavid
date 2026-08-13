"use client";

import { usePathname, useSearchParams } from "next/navigation";

// True while browsing under /exclusive, or on a page (like /search or
// /cart) that's carrying a `?scope=exclusive` param forward from there.
// Drives the header's cart/search/account icons so they behave completely
// separately from the regular site while inside Exclusive.
export function useIsExclusiveScope(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return Boolean(pathname?.startsWith("/exclusive")) || searchParams.get("scope") === "exclusive";
}
