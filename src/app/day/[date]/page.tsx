"use client";

import { useState, use } from "react";
import Link from "next/link";
import { formatHebrewDate } from "@/hooks/useSleepData";
import { useTimeline } from "@/hooks/useTimeline";
import { EventForm } from "@/components/EventForm";
import { Timeline } from "@/components/Timeline";
import { Event } from "@/types";

interface PageProps {
  params: Promise<{ date: string }>;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} דק'`;
  if (mins === 0) return `${hours} שע'`;
  return `${hours} שע' ${mins} דק'`;
}

function summarizeEvents(events: Event[]) {
  let totalSleep = 0;
  let totalAwake = 0;
  let lastSleepStart: Date | null = null;
  let lastWake: Date | null = null;

  const sorted = [...events].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());

  sorted.forEach((event) => {
    const eventDate = new Date(event.occurred_at);
    if (event.type === "sleep_start") {
      if (lastWake) {
        totalAwake += Math.max(0, Math.floor((eventDate.getTime() - lastWake.getTime()) / 60000));
      }
      lastSleepStart = eventDate;
    }
    if (event.type === "wake") {
      if (lastSleepStart) {
        totalSleep += Math.max(0, Math.floor((eventDate.getTime() - lastSleepStart.getTime()) / 60000));
        lastSleepStart = null;
      }
      lastWake = eventDate;
    }
  });

  return { totalSleep, totalAwake };
}

export default function DayPage({ params }: PageProps) {
  const { date } = use(params);
  const { events, loading, error, addEvent, deleteEvent } = useTimeline();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const parsedDate = new Date(date);
  const isValidDate = !Number.isNaN(parsedDate.getTime());
  if (!isValidDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">תאריך לא תקין</p>
      </div>
    );
  }

  const localDateKey = (iso: string) => {
    const eventDate = new Date(iso);
    const y = eventDate.getFullYear();
    const m = String(eventDate.getMonth() + 1).padStart(2, "0");
    const d = String(eventDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const dayEvents = events
    .filter((event) => localDateKey(event.occurred_at) === date)
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());

  const summary = summarizeEvents(dayEvents);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500">טוענת...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const handleAddEvent = async (event: Parameters<typeof addEvent>[0]) => {
    try {
      await addEvent(event);
      setSubmitError(null);
    } catch (err) {
      setSubmitError("שגיאה בהוספת אירוע");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setSubmitError(null);
    } catch (err) {
      setSubmitError("שגיאה במחיקת אירוע");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
      <header className="bg-indigo-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-lg active:opacity-70 shrink-0"
          >
            ←
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">{formatHebrewDate(date)}</h1>
            <p className="text-indigo-200 text-xs">
              {new Date(date + "T12:00:00").toLocaleDateString("he-IL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="w-9" />
        </div>
        <div className="max-w-md mx-auto mt-3 text-center text-sm text-indigo-100">
          <Link href="/" className="underline">
            חזרה לרשימת הימים
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 pb-32 space-y-3">
        <EventForm onAddEvent={handleAddEvent} dateContext={date} />

        {submitError && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{submitError}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="text-slate-500 text-xs mb-2">זמן שינה</div>
            <div className="text-xl font-semibold text-slate-900">{formatDuration(summary.totalSleep)}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="text-slate-500 text-xs mb-2">זמן ער</div>
            <div className="text-xl font-semibold text-slate-900">{formatDuration(summary.totalAwake)}</div>
          </div>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-slate-500 text-lg font-medium">אין אירועים ליום זה</p>
            <p className="text-slate-400 text-sm mt-1">הוסיפי אירועים כדי לראות סדר ומשך שינה</p>
          </div>
        ) : (
          <Timeline events={dayEvents} onDeleteEvent={handleDeleteEvent} />
        )}
      </main>
    </div>
  );
}
