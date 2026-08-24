import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { getProductCollections } from "@/lib/products";

export const metadata: Metadata = {
  title: "Osita David - Collections",
  description: "Browse exclusive collections and merchandise",
};

export default async function CollectionsPage() {
  const collections = await getProductCollections();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav activePage="collections" />

      <main className="pt-[100px] flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-0 pb-8 w-full">
          {collections.length === 0 ? (
            <p className="text-sm text-white/50 uppercase tracking-tight py-12">
              No collections yet.
            </p>
          ) : (
            <div className="flex w-full flex-col gap-16">
              {collections.map((collection) => (
                <div key={collection.name} className="flex flex-col items-center">
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full px-3 md:px-[60px]">
                    {collection.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
