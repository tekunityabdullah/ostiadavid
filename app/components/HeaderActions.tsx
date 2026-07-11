"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";

export function AccountLink() {
  const [href, setHref] = useState("/signup");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHref(user ? "/profile" : "/signup");
    });
  }, []);

  return (
    <Link
      href={href}
      className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
      aria-label="Account"
    >
      <svg viewBox="0 0 256 256" fill="currentColor">
        <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z" />
      </svg>
    </Link>
  );
}

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
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
