import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import GlobalPlayer from "@/app/components/unreleased/GlobalPlayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Osita David",
  description: "Music Artist - Exclusive Content, Tours & Merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-screen flex flex-col bg-black text-white font-sans antialiased"
        suppressHydrationWarning
      >
        <CartProvider>
          {/* Site-wide, like Spotify/YouTube's web player — playback survives
              navigating to other pages instead of stopping when you leave
              /unreleased. */}
          <GlobalPlayer>{children}</GlobalPlayer>
        </CartProvider>
      </body>
    </html>
  );
}
