"use client";

import Link from "next/link";
import { useSleepData, formatHebrewDate, getTotalSleepMinutes } from "@/hooks/useSleepData";
import { SleepEntry } from "@/types";

function getDaysFromYesterdayForward(count: number): string[] {
  const days: string[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 1); // yesterday
  // push yesterday, then the next days forward
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function DaySummary({ entries }: { entries: SleepEntry[] }) {
  if (entries.length === 0) {
    return <span className="text-slate-400 text-sm">אין רישומים עדיין</span>;
  }
  const naps = entries.filter((e) => !e.isNightSleep);
  const nightSleep = entries.find((e) => e.isNightSleep);
  const totalAwake = getTotalSleepMinutes(entries);
  const hours = Math.floor(totalAwake / 60);
  const mins = totalAwake % 60;

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {naps.length > 0 && (
        <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
          ☀️ {naps.length} שנ&quot;צ
        </span>
      )}
      {nightSleep && (
        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          🌙 הרדמה {nightSleep.sleepTime}
        </span>
      )}
      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        ⏱ {hours > 0 ? `${hours}ש' ` : ""}{mins > 0 ? `${mins}ד'` : ""}ער
      </span>
    </div>
  );
}

export default function HomePage() {
  const { getDayData, loading, error } = useSleepData();
  const days = getDaysFromYesterdayForward(14);

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
        <p className="text-slate-400 text-sm">בדקי חיבור לאינטרנט ונסי לרענן</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
      <header className="bg-indigo-600 text-white px-4 py-5 shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center">🌙 שינה של התינוק</h1>
          <p className="text-indigo-200 text-center text-sm mt-1">טווח התצוגה: אתמול ועד שבועיים קדימה — לחצי על יום כדי להוסיף רישומים</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-3 pb-8">
        {days.map((date) => {
          const dayData = getDayData(date);
          const isToday = date === new Date().toISOString().slice(0, 10);
          return (
            <Link
              key={date}
              href={`/day/${date}`}
              className={`block rounded-2xl p-4 shadow-sm border transition-all active:opacity-80 ${
                isToday
                  ? "bg-white border-indigo-300 shadow-indigo-100 shadow-md"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isToday && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      היום
                    </span>
                  )}
                  <span className={`font-semibold ${isToday ? "text-indigo-700" : "text-slate-700"}`}>
                    {isToday ? "" : formatHebrewDate(date)}
                    {isToday && "היום"}
                  </span>
                </div>
                <span className="text-slate-400 text-sm">
                  {new Date(date + "T12:00:00").toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "numeric",
                  })}
                </span>
              </div>
              <DaySummary entries={dayData.entries} />
            </Link>
          );
        })}
      </main>
    </div>
  );
}
