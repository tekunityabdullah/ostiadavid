"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Disc3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Music,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/unreleased", label: "Unreleased", icon: Music },
  { href: "/admin/albums", label: "Albums", icon: Disc3 },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
];

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-white/10 bg-black md:flex">
        <div className="px-6 py-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Osita David</p>
          <p className="mt-1 text-sm font-medium uppercase tracking-tight text-white">Admin</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-[0.15em] transition ${
                  active
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="grid gap-1 border-t border-white/10 px-3 py-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-[0.15em] text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={16} />
            View site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 text-left text-xs uppercase tracking-[0.15em] text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top chrome */}
      <div className="sticky top-0 z-30 flex flex-col border-b border-white/10 bg-black md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Osita David</p>
            <p className="text-xs font-medium uppercase tracking-tight text-white">Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" aria-label="View site" className="text-white/50 transition hover:text-white">
              <ExternalLink size={16} />
            </Link>
            <button onClick={handleSignOut} aria-label="Sign out" className="text-white/50 transition hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-[11px] uppercase tracking-[0.15em] transition ${
                  active ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
