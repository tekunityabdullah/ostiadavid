import type { Metadata } from "next";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import TourForm from "../components/TourForm";

export const metadata: Metadata = {
  title: "Osita David - Tour",
  description: "Music Artist - Exclusive Content, Tours & Merchandise",
};

export default function TourPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav activePage="tour" />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center justify-center flex-1 px-[22px] pt-5 pb-24 mt-8 md:px-6 md:pt-10 lg:px-12">
          <h3 className="text-[30px] md:text-[48px] lg:text-[60px] font-medium uppercase tracking-wide text-white mb-4 text-center">
            Touring Soon
          </h3>

          <TourForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
