"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useSleepData, formatHebrewDate, calcAwakeDuration } from "@/hooks/useSleepData";
import SleepEntryForm from "@/components/SleepEntryForm";
import { SleepEntry } from "@/types";

interface PageProps {
  params: Promise<{ date: string }>;
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: SleepEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const duration = calcAwakeDuration(entry.wakeTime, entry.sleepTime);

  return (
    <div
      className={`rounded-2xl p-4 border ${
        entry.isNightSleep
          ? "bg-indigo-50 border-indigo-200"
          : "bg-white border-slate-100"
      } shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {entry.isNightSleep ? (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                🌙 שנת לילה
              </span>
            ) : (
              <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">
                ☀️ שנ&quot;צ
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-xl p-2">
              <div className="text-xs text-green-600 font-medium mb-0.5">קם</div>
              <div className="text-lg font-bold text-green-700">{entry.wakeTime}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-2">
              <div className="text-xs text-amber-600 font-medium mb-0.5">ער</div>
              <div className="text-sm font-bold text-amber-700 leading-tight">{duration}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-2">
              <div className="text-xs text-blue-600 font-medium mb-0.5">נרדם</div>
              <div className="text-lg font-bold text-blue-700">{entry.sleepTime}</div>
            </div>
          </div>

          {entry.notes && (
            <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
              📝 {entry.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onEdit}
          className="flex-1 text-sm text-slate-500 bg-slate-50 rounded-xl py-2 font-medium active:opacity-70"
        >
          ✏️ ערוך
        </button>
        {confirmDelete ? (
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 text-sm text-slate-500 bg-slate-50 rounded-xl py-2 font-medium"
            >
              לא
            </button>
            <button
              onClick={onDelete}
              className="flex-1 text-sm text-white bg-red-500 rounded-xl py-2 font-medium active:opacity-70"
            >
              מחק
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 text-sm text-red-400 bg-red-50 rounded-xl py-2 font-medium active:opacity-70"
          >
            🗑 מחק
          </button>
        )}
      </div>
    </div>
  );
}

export default function DayPage({ params }: PageProps) {
  const { date } = use(params);
  const { getDayData, addEntry, updateEntry, deleteEntry, loading, error } = useSleepData();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);

  const dayData = getDayData(date);
  const sortedEntries = [...dayData.entries].sort((a, b) =>
    a.wakeTime.localeCompare(b.wakeTime)
  );

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!isValidDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">תאריך לא תקין</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
      {/* Header */}
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
      </header>

      <main className="max-w-md mx-auto px-4 py-4 pb-32 space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-slate-500 text-lg font-medium">אין רישומים ליום זה</p>
            <p className="text-slate-400 text-sm mt-1">לחצי על הכפתור למטה להוסיף</p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditingEntry(entry);
                setShowForm(true);
              }}
              onDelete={() => deleteEntry(date, entry.id)}
            />
          ))
        )}
      </main>

      {/* Add button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
        <button
          onClick={() => {
            setEditingEntry(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white rounded-2xl px-8 py-4 text-base font-bold shadow-xl shadow-indigo-300 active:opacity-80 flex items-center gap-2"
        >
          <span className="text-xl">+</span> הוסיפי רישום
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <SleepEntryForm
          initial={editingEntry ?? undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onSave={(entry) => {
            if (editingEntry) {
              updateEntry(date, editingEntry.id, entry);
            } else {
              addEntry(date, entry);
            }
            setShowForm(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}
