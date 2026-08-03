"use client";

import { useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { deleteEvent } from "./actions";
import { AdminButton } from "./ui";

interface AdminEventTileProps {
  event: EventItem;
  onDeleted?: () => void;
}

export default function AdminEventTile({ event, onDeleted }: AdminEventTileProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    setDeleting(true);
    const formData = new FormData();
    formData.set("event_id", event.id);

    try {
      await deleteEvent(formData);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5">
        {event.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <CalendarDays size={32} className="text-white/30" />
        )}
      </div>

      <div className="grid gap-1">
        <p className="truncate text-sm uppercase tracking-tight text-white">{event.title}</p>
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
          {new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {event.event_time ? ` · ${event.event_time}` : ""}
        </p>
      </div>

      <AdminButton
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full"
      >
        <Trash2 size={14} />
        {deleting ? "Deleting..." : "Delete"}
      </AdminButton>
    </div>
  );
}
