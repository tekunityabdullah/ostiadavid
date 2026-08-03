import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "@/lib/types";

function formatEventDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-4">
      <div className="flex aspect-video items-center justify-center overflow-hidden bg-white/5">
        {event.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <CalendarDays size={32} className="text-white/30" />
        )}
      </div>

      <div className="grid gap-1">
        <p className="text-sm uppercase tracking-tight text-white">{event.title}</p>
        <p className="text-xs text-white/50">
          {formatEventDate(event.event_date)}
          {event.event_time ? ` · ${event.event_time}` : ""}
        </p>
        {event.location && (
          <p className="flex items-center gap-1 text-xs text-white/40">
            <MapPin size={12} />
            {event.location}
          </p>
        )}
      </div>

      {event.description && (
        <p className="text-xs leading-relaxed text-white/50">{event.description}</p>
      )}

      {event.ticket_url && (
        <a
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-10 items-center justify-center border border-white text-xs font-medium uppercase tracking-tight text-white transition hover:bg-white hover:text-black"
        >
          Tickets
        </a>
      )}
    </div>
  );
}
