import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SearchBar from "./SearchBar";
import { getVisibleProducts } from "@/lib/products";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `Osita David - Search: ${query}` : "Osita David - Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const products = await getVisibleProducts();
  const matches = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const hasQuery = query.length > 0;
  const hasMatches = matches.length > 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          {hasQuery && (
            <h1 className="text-sm uppercase tracking-tight text-white mb-6 text-center">
              Search Results{" "}
              <span className="text-white/50">
                ({matches.length} {matches.length === 1 ? "Result" : "Results"})
              </span>
            </h1>
          )}

          <SearchBar defaultValue={query} />

          {!hasQuery ? (
            <p className="text-sm text-white/50 uppercase tracking-tight py-12 text-center">
              Enter a search term to find products.
            </p>
          ) : hasMatches ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-3 md:px-[60px]">
              {matches.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-white/50 uppercase tracking-tight mb-10 text-center">
                No results for &ldquo;{query}&rdquo; — browse our full collection below.
              </p>
              {products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-3 md:px-[60px]">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
