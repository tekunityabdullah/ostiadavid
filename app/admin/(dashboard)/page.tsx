import Link from "next/link";
import { ArrowUpRight, CalendarDays, Disc3, Music, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/app/admin/ui";

async function getCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string
) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [productCount, mediaCount, albumCount, eventCount] = await Promise.all([
    getCount(supabase, "products"),
    getCount(supabase, "unreleased_media"),
    getCount(supabase, "unreleased_albums"),
    getCount(supabase, "events"),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products", icon: Package },
    { label: "Unreleased Media", value: mediaCount, href: "/admin/unreleased", icon: Music },
    { label: "Albums", value: albumCount, href: "/admin/albums", icon: Disc3 },
    { label: "Events", value: eventCount, href: "/admin/events", icon: CalendarDays },
  ];

  return (
    <div className="grid gap-10">
      <AdminPageHeader eyebrow="Admin dashboard" title="Overview" />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/30 hover:bg-white/[0.04]"
          >
            <div className="mb-8 flex items-center justify-between">
              <Icon size={20} className="text-white/40" />
              <ArrowUpRight
                size={16}
                className="text-white/20 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
              />
            </div>
            <p className="text-3xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">{label}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
