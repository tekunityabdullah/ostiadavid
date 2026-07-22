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
          src="/logo.png"
          alt="Osita David"
          width={200}
          height={90}
        />
      </Link>

      {/* Action buttons (right) */}
      <div className="absolute right-4 sm:right-6 flex items-center gap-3">
        <SearchOverlay />
        <AccountLink />
        <CartLink />
      </div>
    </header>
  );
}
