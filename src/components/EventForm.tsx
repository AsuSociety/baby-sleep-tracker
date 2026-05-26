"use client";

import { useState } from "react";
import { Event, EventType } from "@/types";

interface EventFormProps {
  onAddEvent: (event: Omit<Event, "id" | "source">) => Promise<void>;
  dateContext?: string; // YYYY-MM-DD format for day page, if provided
}

export function EventForm({ onAddEvent, dateContext }: EventFormProps) {
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType>("note");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!time) {
      alert("בחרי שעה");
      return;
    }

    setLoading(true);
    try {
      // Use provided date or default to yesterday at 00:00
      const baseDate = new Date();
      if (dateContext) {
        // If dateContext provided (from day page), use that date
        const [year, month, day] = dateContext.split("-").map(Number);
        baseDate.setFullYear(year, month - 1, day);
      } else {
        // Otherwise use yesterday
        baseDate.setDate(baseDate.getDate() - 1);
      }
      baseDate.setHours(0, 0, 0, 0);

      const [hours, minutes] = time.split(":").map(Number);
      const eventTime = new Date(baseDate);
      eventTime.setHours(hours, minutes, 0, 0);

      await onAddEvent({
        occurred_at: eventTime.toISOString(),
        type,
        detail: detail || undefined,
      });

      // Reset form
      setTime("");
      setType("note");
      setDetail("");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("שגיאה בהוספת אירוע");
    } finally {
      setLoading(false);
    }
  };

  const eventTypeLabels: Record<EventType, string> = {
    wake: "קם",
    sleep_start: "הלך לישון",
    tired_sign: "סימן עייפות",
    note: "הערה",
    other: "אחר",
  };

  const eventTypes: EventType[] = ["wake", "sleep_start", "tired_sign", "note", "other"];


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-6">
      <h2 className="font-semibold text-slate-800 mb-4">הוסיפי אירוע</h2>

      <div className="space-y-3">
        {/* Time Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">שעה (HH:mm)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ direction: "ltr" }}
          />
        </div>

        {/* Event Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">סוג אירוע</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {eventTypes.map((t) => (
            <option key={t} value={t}>
              {eventTypeLabels[t]}
            </option>
          ))}
          </select>
        </div>

        {/* Detail Textarea */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">תיאור (optional)</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="לדוגמה: שפשוף עיניים, ידיים ושירים..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "מוסיפה..." : "✅ הוסיפי אירוע"}
        </button>
      </div>
    </form>
  );
}
