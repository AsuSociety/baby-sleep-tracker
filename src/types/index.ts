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

export type EventType = 'wake' | 'sleep_start' | 'tired_sign' | 'note' | 'other';

export interface Event {
  id: string;
  occurred_at: string; // ISO 8601 timestamp
  type: EventType;
  detail?: string;
  source?: string;
}
