import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import MediaLibrary from "../components/unreleased/MediaLibrary";
import { getUnreleasedMedia } from "@/lib/unreleased";

export const metadata: Metadata = {
  title: "Osita David - Unreleased",
  description: "Stream unreleased tracks and videos",
};

export default async function UnreleasedPage() {
  const media = await getUnreleasedMedia();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav activePage="unreleased" />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          <div className="mb-12 flex w-full flex-col items-center">
            <span className="mb-3 text-[10px] uppercase tracking-[0.4em] text-white/40">
              Osita David
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium uppercase tracking-[0.08em] text-white text-center">
              Unreleased
            </h1>
            <span className="mt-6 h-px w-12 bg-white/20" />
          </div>

          {media.length === 0 ? (
            <p className="text-sm text-white/50 uppercase tracking-tight py-12">
              No unreleased media available yet.
            </p>
          ) : (
            <MediaLibrary media={media} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
