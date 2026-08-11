import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PlaylistDetail from "../../../components/unreleased/PlaylistDetail";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnreleasedPlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-24 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <PlaylistDetail playlistId={id} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
