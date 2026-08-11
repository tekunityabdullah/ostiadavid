import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getAlbums, getUnreleasedMedia } from "@/lib/unreleased";

export const metadata: Metadata = {
  title: "Osita David - Albums",
  description: "Unreleased albums",
};

export default async function UnreleasedAlbumsPage() {
  const [albums, media] = await Promise.all([getAlbums(), getUnreleasedMedia()]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-24 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <h1 className="mb-10 text-2xl font-medium uppercase tracking-wide text-white sm:text-3xl">
            Albums
          </h1>

          <div className="w-full max-w-[900px]">
            {albums.length === 0 ? (
              <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
                No albums yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {albums.map((album) => {
                  const trackCount = media.filter(
                    (m) => m.album_id === album.id && m.media_type === "audio"
                  ).length;

                  return (
                    <Link key={album.id} href={`/unreleased/albums/${album.id}`} className="grid gap-2">
                      <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5 transition group-hover:opacity-80">
                        {album.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.cover_image}
                            alt={album.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Disc3 size={28} className="text-white/30" />
                        )}
                      </div>
                      <div>
                        <p className="truncate text-xs uppercase tracking-tight text-white">
                          {album.title}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {trackCount} {trackCount === 1 ? "track" : "tracks"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
