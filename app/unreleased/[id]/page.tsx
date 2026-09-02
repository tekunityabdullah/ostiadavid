import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MediaDetail from "../../components/unreleased/MediaDetail";
import { getStreamUrl, getUnreleasedMedia, getUnreleasedMediaById } from "@/lib/unreleased";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getUnreleasedMediaById(id);

  if (!item) {
    return { title: "Osita David - Unreleased" };
  }

  return {
    title: `Osita David - ${item.title}`,
    description:
      item.description ||
      `Stream "${item.title}" — an unreleased ${item.media_type} from Osita David.`,
  };
}

export default async function UnreleasedDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const item = await getUnreleasedMediaById(id);

  if (!item) {
    notFound();
  }

  const media = await getUnreleasedMedia();
  const related = media
    .filter((m) => m.id !== item.id && m.media_type === item.media_type)
    .slice(0, 6);

  // Resolved server-side so the image can start fetching immediately on
  // page load instead of waiting on a client round-trip after mount.
  // Video/audio don't need this anymore — they stream through
  // /api/unreleased/media/[id], a stable route known upfront, rather than
  // a signed URL that has to be resolved first.
  const initialStream =
    item.media_type === "image" ? await getStreamUrl(item.id) : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-24 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <MediaDetail item={item} related={related} initialStreamUrl={initialStream?.url ?? null} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
