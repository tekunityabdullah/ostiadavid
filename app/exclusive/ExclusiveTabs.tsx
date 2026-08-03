"use client";

import { useMemo, useState } from "react";
import type { EventItem, Product, UnreleasedMediaSummary } from "@/lib/types";
import ProductCard from "../components/ProductCard";
import MediaLibrary from "../components/unreleased/MediaLibrary";
import EventCard from "./EventCard";

type Tab = "clothes" | "unreleased" | "events";
type EventFilter = "upcoming" | "past";

interface ExclusiveTabsProps {
  products: Product[];
  media: UnreleasedMediaSummary[];
  events: EventItem[];
}

export default function ExclusiveTabs({ products, media, events }: ExclusiveTabsProps) {
  const [tab, setTab] = useState<Tab>("clothes");
  const [eventFilter, setEventFilter] = useState<EventFilter>("upcoming");

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
      <div className="mb-10 flex justify-center gap-10 text-xs sm:gap-16">
        {(
          [
            ["clothes", "Clothes"],
            ["unreleased", "Unreleased"],
            ["events", "Events"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`uppercase tracking-[0.15em] transition ${
              tab === value ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div className="mb-10 flex justify-center gap-10 text-[11px]">
          {(
            [
              ["upcoming", "Upcoming"],
              ["past", "Past"],
            ] as [EventFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setEventFilter(value)}
              className={`uppercase tracking-[0.15em] transition ${
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
          <div className="grid w-full grid-cols-2 gap-4 px-3 md:grid-cols-4 md:px-[60px]">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
            <MediaLibrary media={media} />
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
