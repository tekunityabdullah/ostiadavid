import Image from "next/image";
import Link from "next/link";
import SearchOverlay from "./SearchOverlay";
import { AccountLink, CartLink } from "./HeaderActions";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-[100] flex justify-center items-center px-4 sm:px-6 h-[56px] sm:h-[68px] bg-black">
      {/* Close button (left) */}
      <div className="absolute left-4 sm:left-6">
        <button
          className="bg-transparent border-none text-black cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-6 [&_svg]:h-6"
          aria-label="Close"
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

      <Link href="/">
        <Image
          className="h-12 sm:h-18 w-auto"
          src="https://staging.internalstaging.com/custom/ositadavid/logo.png"
          alt="Osita David"
          width={200}
          height={90}
        />
      </Link>

      {/* Action buttons (right) */}
      <div className="absolute right-4 sm:right-6 flex items-center gap-3">
        <button
          className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center transition-opacity duration-200 hover:opacity-70 active:scale-95 [&_svg]:w-5 [&_svg]:h-5"
          aria-label="Search"
        >
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
          </svg>
        </button>

        <AccountLink />
        <CartLink />
      </div>
    </header>
  );
}
