import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SearchBar from "./SearchBar";
import MusicGrid from "../components/unreleased/MusicGrid";
import VideoGrid from "../components/unreleased/VideoGrid";
import ImageGrid from "../components/unreleased/ImageGrid";
import { getExclusiveProducts, getRegularProducts } from "@/lib/products";
import { getUnreleasedMedia } from "@/lib/unreleased";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; scope?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `Osita David - Search: ${query}` : "Osita David - Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, scope } = await searchParams;
  const query = (q ?? "").trim();
  const isExclusive = scope === "exclusive";

  // Searching from inside Exclusive only ever searches Exclusive content,
  // and vice versa — the two catalogs never mix in results, matching the
  // same separation as the cart and account menu. Exclusive additionally
  // searches unreleased audio/video/images — the regular catalog has no
  // equivalent, so it only ever searches products.
  const products = isExclusive ? await getExclusiveProducts() : await getRegularProducts();
  const media = isExclusive ? await getUnreleasedMedia() : [];

  const matches = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];
  const mediaMatches = query
    ? media.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : [];
  const audioMatches = mediaMatches.filter((m) => m.media_type === "audio");
  const videoMatches = mediaMatches.filter((m) => m.media_type === "video");
  const imageMatches = mediaMatches.filter((m) => m.media_type === "image");

  const hasQuery = query.length > 0;
  const hasMatches = matches.length > 0 || mediaMatches.length > 0;
  const totalMatches = matches.length + mediaMatches.length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          {hasQuery && (
            <h1 className="text-sm uppercase tracking-tight text-white mb-6 text-center">
              Search Results{" "}
              <span className="text-white/50">
                ({totalMatches} {totalMatches === 1 ? "Result" : "Results"})
              </span>
            </h1>
          )}

          <SearchBar defaultValue={query} scope={isExclusive ? "exclusive" : undefined} />

          {!hasQuery ? (
            <p className="text-sm text-white/50 uppercase tracking-tight py-12 text-center">
              Enter a search term to find products.
            </p>
          ) : hasMatches ? (
            <div className="grid w-full gap-10">
              {matches.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-3 md:px-[60px]">
                  {matches.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {audioMatches.length > 0 && (
                <div className="w-full px-3 md:px-[60px]">
                  <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white">
                    Music
                  </h2>
                  <MusicGrid tracks={audioMatches} hideActions />
                </div>
              )}

              {videoMatches.length > 0 && (
                <div className="w-full px-3 md:px-[60px]">
                  <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white">
                    Videos
                  </h2>
                  <VideoGrid videos={videoMatches} hideActions />
                </div>
              )}

              {imageMatches.length > 0 && (
                <div className="w-full px-3 md:px-[60px]">
                  <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white">
                    Images
                  </h2>
                  <ImageGrid images={imageMatches} hideActions />
                </div>
              )}
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
