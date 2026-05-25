export interface SleepEntry {
  id: string;
  wakeTime: string;   // "HH:mm"
  sleepTime: string;  // "HH:mm"
  isNightSleep: boolean;
  notes?: string;
}

export interface DayData {
  date: string; // "YYYY-MM-DD"
  entries: SleepEntry[];
}

export type AllData = Record<string, DayData>;
