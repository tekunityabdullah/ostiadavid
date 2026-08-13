"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import { cancelExclusiveSubscription } from "@/app/profile/actions";

// Header icons only ever need to know "am I currently inside /exclusive",
// which pathname alone answers — deliberately not using useSearchParams()
// here, since Header renders on every page (including statically-generated
// ones) and that hook would force a Suspense boundary everywhere it's used.
function useIsOnExclusivePage() {
  const pathname = usePathname();
  return pathname?.startsWith("/exclusive") ?? false;
}

export function AccountLink() {
  const isExclusive = useIsOnExclusivePage();
  const router = useRouter();
  const [href, setHref] = useState("/signup");
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHref(user ? "/profile" : "/signup");
      setLoggedIn(Boolean(user));
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleCancelSubscription = async () => {
    if (!window.confirm("Cancel your Exclusive membership? You'll lose access immediately.")) {
      return;
    }
    setCancelling(true);
    try {
      const result = await cancelExclusiveSubscription();
      if (result.ok) {
        setOpen(false);
        router.push("/");
        router.refresh();
      } else {
        alert(result.message);
      }
    } finally {
      setCancelling(false);
    }
  };

  const icon = (
    <svg viewBox="0 0 256 256" fill="currentColor">
      <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z" />
    </svg>
  );

  // Inside Exclusive, the avatar opens a dropdown of membership-specific
  // actions instead of just linking to the regular account page — the
  // options here only make sense for an active Exclusive member.
  if (isExclusive && loggedIn) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
          aria-label="Account"
          aria-expanded={open}
        >
          {icon}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-3 w-56 border border-white/15 bg-black py-1 text-left">
            <Link
              href="/profile?scope=exclusive"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs font-sans uppercase text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              See Orders
            </Link>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs font-sans uppercase text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Exit Exclusive
            </Link>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="block w-full px-4 py-2.5 text-left text-xs font-sans uppercase text-red-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
      aria-label="Account"
    >
      {icon}
    </Link>
  );
}

export function CartLink() {
  const { items } = useCart();
  const isExclusive = useIsOnExclusivePage();

  // The cart is one shared store, but Exclusive and the regular site must
  // never show each other's items — an exclusive song/video/clothing item
  // should never appear mixed in with a regular-site purchase or vice
  // versa, so the badge (and the /cart page itself, via ?scope=) only
  // counts the items belonging to whichever side you're currently on.
  const itemCount = items
    .filter((i) => Boolean(i.isExclusive) === isExclusive)
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href={isExclusive ? "/cart?scope=exclusive" : "/cart"}
      className="relative bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
      aria-label="Cart"
    >
      <svg viewBox="0 0 256 256" fill="currentColor">
        <path d="M230.14,58.87A8,8,0,0,0,224,56H62.68L56.6,22.57A8,8,0,0,0,48.73,16H24a8,8,0,0,0,0,16h18L67.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,160,204a28,28,0,1,0,28-28H91.17a8,8,0,0,1-7.87-6.57L80.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,230.14,58.87ZM104,204a12,12,0,1,1-12-12A12,12,0,0,1,104,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,200,204Z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
