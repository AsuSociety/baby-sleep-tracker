"use client";

import { Event } from "@/types";

function formatHebrewTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "בוקר";
  if (hour >= 12 && hour < 17) return "אחרי הצהריים";
  if (hour >= 17 && hour < 21) return "ערב";
  return "לילה";
}

function formatEventType(type: Event["type"]): string {
  const labels: Record<Event["type"], string> = {
    wake: "קם",
    sleep_start: "הלך לישון",
    tired_sign: "סימן עייפות",
    note: "הערה",
    other: "אחר",
  };
  return labels[type] || type;
}

interface TimelineProps {
  events: Event[];
  onDeleteEvent?: (id: string) => Promise<void>;
}

export function Timeline({ events, onDeleteEvent }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <p>אין אירועים עדיין</p>
      </div>
    );
  }

  // Group events by time-of-day and date
  const grouped: Record<string, Record<string, Event[]>> = {};

  events.forEach((event) => {
    const date = new Date(event.occurred_at);
    const dateKey = date.toISOString().slice(0, 10);
    const timeOfDay = getTimeOfDay(date);
    const key = `${dateKey}_${timeOfDay}`;

    if (!grouped[key]) grouped[key] = {};
    if (!grouped[key][timeOfDay]) grouped[key][timeOfDay] = [];
    grouped[key][timeOfDay].push(event);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([key, dayGroups]) => (
        <div key={key} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          {Object.entries(dayGroups).map(([timeOfDay, dayEvents]) => (
            <div key={timeOfDay} className="mb-4 last:mb-0">
              <h3 className="text-indigo-700 font-semibold text-sm mb-2">{timeOfDay}</h3>
              <div className="space-y-2 text-sm">
                {dayEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 text-slate-700">
                    <span className="font-mono text-indigo-600 min-w-[50px]">
                      {formatHebrewTime(event.occurred_at)}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{formatEventType(event.type)}</span>
                      {event.detail && <span className="text-slate-600"> — {event.detail}</span>}
                    </span>
                    {onDeleteEvent && (
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-xs text-red-600 hover:text-red-800 transition"
                      >
                        מחק
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
