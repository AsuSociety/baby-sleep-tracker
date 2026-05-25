"use client";

import { useState } from "react";
import { SleepEntry } from "@/types";
import { calcAwakeDuration } from "@/hooks/useSleepData";

interface Props {
  onSave: (entry: Omit<SleepEntry, "id">) => void;
  onCancel: () => void;
  initial?: SleepEntry;
}

function getNow(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function SleepEntryForm({ onSave, onCancel, initial }: Props) {
  const [wakeTime, setWakeTime] = useState(initial?.wakeTime ?? getNow());
  const [sleepTime, setSleepTime] = useState(initial?.sleepTime ?? "");
  const [isNightSleep, setIsNightSleep] = useState(initial?.isNightSleep ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  const duration =
    wakeTime && sleepTime ? calcAwakeDuration(wakeTime, sleepTime) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wakeTime) {
      setError("נא להזין שעת קימה");
      return;
    }
    if (!sleepTime) {
      setError("נא להזין שעת הרדמה");
      return;
    }
    setError("");
    onSave({ wakeTime, sleepTime, isNightSleep, notes: notes || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-safe">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-5 text-center">
            {initial ? "✏️ עריכת רישום" : "➕ רישום חדש"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Wake Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                ☀️ שעת קימה
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-indigo-400 focus:outline-none text-slate-800"
              />
            </div>

            {/* Sleep Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                😴 שעת הרדמה
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-indigo-400 focus:outline-none text-slate-800"
              />
            </div>

            {/* Duration display */}
            {duration && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
                <span className="text-amber-700 font-medium text-sm">
                  ⏱ זמן ערות: <strong>{duration}</strong>
                </span>
              </div>
            )}

            {/* Night sleep toggle */}
            <button
              type="button"
              onClick={() => setIsNightSleep((v) => !v)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold border-2 transition-colors ${
                isNightSleep
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              🌙 שנת לילה {isNightSleep ? "✓" : ""}
            </button>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                📝 הערות (אופציונלי)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="למשל: התעורר בגלל רעש..."
                rows={2}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none text-slate-800 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-slate-100 text-slate-700 rounded-xl py-3 font-semibold text-base active:opacity-70"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-semibold text-base active:opacity-80 shadow-lg shadow-indigo-200"
              >
                שמירה
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
