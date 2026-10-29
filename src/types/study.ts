export type SubjectType =
  | 'DSA'
  | 'AI/ML'
  | 'RAG & LLMs'
  | 'College Subjects'
  | 'Other'
  | string;

export interface StudyInterval {
  start: number; // Unix timestamp in ms
  end: number;   // Unix timestamp in ms
}

export interface StudySession {
  id: string;
  subject: string;
  startTime: number;          // Unix timestamp in ms when session initiated
  endTime: number;            // Unix timestamp in ms when session completed
  durationMs: number;         // Total active duration in ms (sum of intervals)
  intervals: StudyInterval[]; // Precise list of active study periods
  notes?: string;
  createdAt: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface ActiveSessionState {
  status: TimerStatus;
  subject: string;
  sessionStartTime: number | null;
  currentIntervalStart: number | null; // active interval start timestamp, null when paused/idle
  accumulatedMs: number;               // Sum of completed intervals in current session
  intervals: StudyInterval[];          // Completed intervals in current session
  notes: string;
  lastHeartbeat?: number;              // Timestamp of last active tick/interaction
}

export interface UserSettings {
  dailyGoalMinutes: number; // Default: 180 (3 hours)
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  autoBreakReminder: boolean;
  breakReminderMinutes: number;
}

export interface DayStudySummary {
  dateStr: string;   // 'YYYY-MM-DD'
  dayName: string;   // 'Mon', 'Tue', etc.
  formattedDate: string; // 'Oct 27'
  durationMs: number;
  durationMinutes: number;
  durationHours: number;
  sessionCount: number;
}

export interface SubjectStudySummary {
  subject: string;
  durationMs: number;
  durationMinutes: number;
  durationHours: number;
  percentage: number;
  color: string;
}

export interface ActiveDateRange {
  startDate: string; // 'YYYY-MM-DD' or ''
  endDate: string;   // 'YYYY-MM-DD' or ''
  subjectFilter: string; // 'ALL' or specific subject
  searchQuery: string;
}
