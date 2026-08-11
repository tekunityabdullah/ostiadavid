import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import AlbumDetail from "../../../components/unreleased/AlbumDetail";
import { getAlbumById, getAlbumTracks } from "@/lib/unreleased";

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;
  const album = await getAlbumById(id);

  if (!album) {
    return { title: "Osita David - Albums" };
  }

  return {
    title: `Osita David - ${album.title}`,
    description: album.description || `Stream "${album.title}" — an unreleased album from Osita David.`,
  };
}

export default async function UnreleasedAlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const album = await getAlbumById(id);

  if (!album) {
    notFound();
  }

  const tracks = await getAlbumTracks(id);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-24 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <AlbumDetail album={album} tracks={tracks} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
