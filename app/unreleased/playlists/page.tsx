import type { Metadata } from "next";
import Header from "../../components/Header";
import SubNav from "../../components/SubNav";
import Footer from "../../components/Footer";
import PlaylistsBrowser from "../../components/unreleased/PlaylistsBrowser";

export const metadata: Metadata = {
  title: "Osita David - Playlists",
  description: "Your Unreleased playlists",
};

export default function UnreleasedPlaylistsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav activePage="unreleased" />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-16 w-full">
          <h1 className="mb-10 text-2xl font-medium uppercase tracking-wide text-white sm:text-3xl">
            Playlists
          </h1>
          <PlaylistsBrowser />
        </section>
      </main>

      <Footer />
    </div>
  );
}
