import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import ExclusiveTabs from "./ExclusiveTabs";
import { getExclusiveProducts } from "@/lib/products";
import { getUnreleasedMedia } from "@/lib/unreleased";
import { getEvents } from "@/lib/events";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ExclusivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  const isExclusive = profile?.account_type === "exclusive";

  if (!isExclusive) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <SubNav activePage="exclusive" />

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl md:text-4xl font-medium uppercase tracking-wide mb-4">
              Exclusive Access Required
            </h1>
            <p className="text-sm text-white/70 mb-8">
              You need an exclusive membership to access members-only drops, unreleased media, and events.
            </p>
            <Link
              href="/signup/exclusive"
              className="inline-block px-8 py-3 text-xs uppercase tracking-tight font-medium text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5]"
            >
              Sign Up for Exclusive
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const [products, media, events] = await Promise.all([
    getExclusiveProducts(),
    getUnreleasedMedia(),
    getEvents(),
  ]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="pt-24 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          <ExclusiveTabs products={products} media={media} events={events} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
