import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
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
      <body className="min-h-screen flex flex-col bg-black text-white font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
