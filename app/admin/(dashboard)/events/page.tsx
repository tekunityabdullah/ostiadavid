"use client";

import { useCallback, useEffect, useState } from "react";
import AdminEventTile from "@/app/admin/AdminEventTile";
import EventForm from "@/app/admin/EventForm";
import { AdminCard, AdminPageHeader, CardHeading } from "@/app/admin/ui";
import type { EventItem } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const loadEvents = useCallback(() => {
    return fetch("/api/admin/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="grid gap-10">
      <AdminPageHeader eyebrow="Admin dashboard" title="Events" />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <AdminCard>
          <CardHeading title="Add event" />
          <EventForm onSuccess={loadEvents} />
        </AdminCard>

        <div className="grid gap-5">
          <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/55">Events</h2>
            <span className="text-sm text-white/45">{events.length}</span>
          </div>

          {loadingEvents ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">Loading...</p>
          ) : events.length === 0 ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">No events yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {events.map((event) => (
                <AdminEventTile
                  key={event.id}
                  event={event}
                  onDeleted={loadEvents}
                  onUpdated={loadEvents}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
