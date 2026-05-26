"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types";

export function useTimeline() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      // Start from yesterday at 00:00 (midnight yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const startTime = yesterday.toISOString();

      // Fetch all events from yesterday 00:00 onwards, ordered by time
      const { data, error: queryError } = await supabase
        .from("events")
        .select("*")
        .gte("occurred_at", startTime)
        .order("occurred_at", { ascending: true });

      if (queryError) {
        console.error("Timeline fetch error:", queryError);
        setError("שגיאה בטעינת אירועים");
      } else if (data) {
        setEvents(
          data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            occurred_at: row.occurred_at as string,
            type: row.type as Event["type"],
            detail: (row.detail as string) ?? undefined,
            source: (row.source as string) ?? undefined,
          }))
        );
      }
      setLoading(false);
    }

    load();
  }, []);

  const addEvent = async (event: Omit<Event, "id" | "source">) => {
    const id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    const newEvent: Event = { ...event, id, source: "manual" };

    setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()));

    const { error } = await supabase.from("events").insert({
      id,
      occurred_at: event.occurred_at,
      type: event.type,
      detail: event.detail ?? null,
      source: "manual",
    });

    if (error) {
      console.error("Insert event error:", error);
      setError("שגיאה בהוספת אירוע");
      // Rollback
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return { events, loading, error, addEvent };
}
