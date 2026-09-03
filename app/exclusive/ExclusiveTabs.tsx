"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EventItem, Product, UnreleasedMediaSummary } from "@/lib/types";
import MediaLibrary from "../components/unreleased/MediaLibrary";
import EventCard from "./EventCard";
import ExclusiveClothesCard from "./ExclusiveClothesCard";

type Tab = "clothes" | "unreleased" | "events";
type EventFilter = "upcoming" | "past";

interface ExclusiveTabsProps {
  products: Product[];
  media: UnreleasedMediaSummary[];
  events: EventItem[];
}

const VALID_TABS: Tab[] = ["clothes", "unreleased", "events"];

export default function ExclusiveTabs({ products, media, events }: ExclusiveTabsProps) {
  // Lets links back into this page (e.g. from a track/video detail page's
  // "Unreleased" breadcrumb) land on the right tab instead of always
  // resetting to the default. Landing on /exclusive fresh — e.g. clicking
  // the Exclusive nav link — defaults to Unreleased (which itself defaults
  // to the Music sub-tab, see MediaLibrary's resolveInitialTab).
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "unreleased";
  // True only when the URL explicitly asked for Unreleased (a genuine
  // "returning" navigation) — not when we just defaulted to it ourselves.
  const unreleasedExplicitlyRequested = requestedTab === "unreleased";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [eventFilter, setEventFilter] = useState<EventFilter>("upcoming");

  // Tab clicks don't trigger a Next.js navigation (kept snappy, no
  // server round-trip) — but that means the address bar never picks up
  // which tab is active. Without this, the browser's Back button (and any
  // link that lands plainly on /exclusive) always restores whatever the
  // URL said on first load, i.e. Clothes. Silently syncing the URL via the
  // native History API keeps the current tab as part of this history
  // entry, so Back from a track/video detail page returns to the right tab.
  const selectTab = (value: Tab) => {
    setTab(value);
    const url = value === "clothes" ? "/exclusive" : `/exclusive?tab=${value}`;
    window.history.replaceState(null, "", url);
  };

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      upcoming: events.filter((e) => e.event_date >= today),
      past: [...events.filter((e) => e.event_date < today)].reverse(),
    };
  }, [events]);

  const shownEvents = eventFilter === "upcoming" ? upcoming : past;

  return (
    <div className="w-full">
      <div className="mb-8 flex w-full max-w-[900px] justify-between gap-6 text-xs mx-auto sm:justify-center sm:gap-10 md:gap-14 lg:gap-20">
        {(
          [
            ["clothes", "Clothes"],
            ["unreleased", "Unreleased"],
            ["events", "Events"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => selectTab(value)}
            className={`font-sans uppercase transition ${
              value === "clothes" ? "translate-x-1" : value === "events" ? "-translate-x-1" : ""
            } ${tab === value ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div className="mb-10 flex w-full justify-center gap-16 px-6 text-[11px] sm:gap-24 md:gap-32 lg:gap-40">
          {(
            [
              ["upcoming", "Upcoming"],
              ["past", "Past"],
            ] as [EventFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setEventFilter(value)}
              className={`font-sans uppercase transition ${
                eventFilter === value ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "clothes" &&
        (products.length === 0 ? (
          <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
            No exclusive drops available yet.
          </p>
        ) : (
          <div className="flex w-full flex-col items-center">
            {products.map((product) => (
              <ExclusiveClothesCard key={product.id} product={product} />
            ))}
          </div>
        ))}

      {tab === "unreleased" &&
        (media.length === 0 ? (
          <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
            No unreleased media available yet.
          </p>
        ) : (
          <div className="flex justify-center">
            <MediaLibrary media={media} preferRememberedTab={unreleasedExplicitlyRequested} />
          </div>
        ))}

      {tab === "events" &&
        (shownEvents.length === 0 ? (
          <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
            {eventFilter === "upcoming" ? "No upcoming events yet." : "No past events yet."}
          </p>
        ) : (
          <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2">
            {shownEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ))}
    </div>
  );
}
