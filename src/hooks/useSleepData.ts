"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AllData, DayData, SleepEntry } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// DB row → SleepEntry
function rowToEntry(row: Record<string, unknown>): SleepEntry {
  return {
    id: row.id as string,
    wakeTime: row.wake_time as string,
    sleepTime: row.sleep_time as string,
    isNightSleep: row.is_night_sleep as boolean,
    notes: (row.notes as string) ?? undefined,
  };
}

export function useSleepData() {
  const [allData, setAllData] = useState<AllData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all entries once on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sleep_entries")
        .select("*")
        .order("date", { ascending: false })
        .order("wake_time", { ascending: true });

      if (error) {
        console.error("Supabase load error:", error);
        setError("שגיאה בטעינת הנתונים");
      } else if (data) {
        const mapped: AllData = {};
        for (const row of data) {
          const date = row.date as string;
          if (!mapped[date]) mapped[date] = { date, entries: [] };
          mapped[date].entries.push(rowToEntry(row));
        }
        setAllData(mapped);
      }
      setLoading(false);
    }
    load();
  }, []);

  const getDayData = useCallback(
    (date: string): DayData => allData[date] ?? { date, entries: [] },
    [allData]
  );

  const addEntry = useCallback(
    async (date: string, entry: Omit<SleepEntry, "id">) => {
      const id = generateId();
      const newEntry: SleepEntry = { ...entry, id };

      // Optimistic update
      setAllData((prev) => {
        const day = prev[date] ?? { date, entries: [] };
        return { ...prev, [date]: { ...day, entries: [...day.entries, newEntry] } };
      });

      const { error } = await supabase.from("sleep_entries").insert({
        id,
        date,
        wake_time: entry.wakeTime,
        sleep_time: entry.sleepTime,
        is_night_sleep: entry.isNightSleep,
        notes: entry.notes ?? null,
      });

      if (error) {
        // Rollback
        setAllData((prev) => {
          const day = prev[date];
          if (!day) return prev;
          return { ...prev, [date]: { ...day, entries: day.entries.filter((e) => e.id !== id) } };
        });
        console.error("Supabase insert error:", error);
        setError("שגיאה בשמירה");
      }
    },
    []
  );

  const updateEntry = useCallback(
    async (date: string, id: string, patch: Partial<Omit<SleepEntry, "id">>) => {
      // Optimistic update
      setAllData((prev) => {
        const day = prev[date];
        if (!day) return prev;
        return {
          ...prev,
          [date]: { ...day, entries: day.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) },
        };
      });

      const dbPatch: Record<string, unknown> = {};
      if (patch.wakeTime !== undefined) dbPatch.wake_time = patch.wakeTime;
      if (patch.sleepTime !== undefined) dbPatch.sleep_time = patch.sleepTime;
      if (patch.isNightSleep !== undefined) dbPatch.is_night_sleep = patch.isNightSleep;
      if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;

      const { error } = await supabase.from("sleep_entries").update(dbPatch).eq("id", id);
      if (error) {
        console.error("Supabase update error:", error);
        setError("שגיאה בעדכון");
      }
    },
    []
  );

  const deleteEntry = useCallback(async (date: string, id: string) => {
    // Optimistic update
    setAllData((prev) => {
      const day = prev[date];
      if (!day) return prev;
      return { ...prev, [date]: { ...day, entries: day.entries.filter((e) => e.id !== id) } };
    });

    const { error } = await supabase.from("sleep_entries").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      setError("שגיאה במחיקה");
    }
  }, []);

  return { allData, loading, error, getDayData, addEntry, updateEntry, deleteEntry };
}

export function calcAwakeDuration(wakeTime: string, sleepTime: string): string {
  const [wh, wm] = wakeTime.split(":").map(Number);
  const [sh, sm] = sleepTime.split(":").map(Number);
  let wakeMinutes = wh * 60 + wm;
  let sleepMinutes = sh * 60 + sm;
  if (sleepMinutes < wakeMinutes) sleepMinutes += 24 * 60;
  const diff = sleepMinutes - wakeMinutes;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins} דק'`;
  if (mins === 0) return `${hours} שע'`;
  return `${hours} שע' ${mins} דק'`;
}

export function formatHebrewDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

  if (toDateStr(date) === toDateStr(today)) return "היום";
  if (toDateStr(date) === toDateStr(yesterday)) return "אתמול";

  return date.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getTotalSleepMinutes(entries: SleepEntry[]): number {
  return entries.reduce((total, e) => {
    const [wh, wm] = e.wakeTime.split(":").map(Number);
    const [sh, sm] = e.sleepTime.split(":").map(Number);
    let wakeMin = wh * 60 + wm;
    let sleepMin = sh * 60 + sm;
    if (sleepMin < wakeMin) sleepMin += 24 * 60;
    return total + (sleepMin - wakeMin);
  }, 0);
}
