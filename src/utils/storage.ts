import { StudySession, ActiveSessionState, UserSettings } from '../types/study';

const SESSIONS_KEY = 'studyflow_sessions';
const ACTIVE_SESSION_KEY = 'studyflow_active_session';
const SETTINGS_KEY = 'studyflow_settings';
const SUBJECTS_KEY = 'studyflow_subjects';

export const DEFAULT_SUBJECTS: string[] = [
  'DSA',
  'AI/ML',
  'RAG & LLMs',
  'College Subjects',
  'Other',
];

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalMinutes: 180, // 3 hours
  theme: 'dark',
  soundEnabled: true,
  autoBreakReminder: false,
  breakReminderMinutes: 50,
};

export const DEFAULT_ACTIVE_SESSION: ActiveSessionState = {
  status: 'idle',
  subject: 'DSA',
  sessionStartTime: null,
  currentIntervalStart: null,
  accumulatedMs: 0,
  intervals: [],
  notes: '',
  lastHeartbeat: undefined,
};

/**
 * Robust JSON parse with fallback.
 */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('StudyFlow: Failed to parse localStorage item:', error);
    return fallback;
  }
}

/**
 * Robust localStorage setter.
 */
function safeSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`StudyFlow: Failed to write to localStorage for key "${key}":`, error);
    return false;
  }
}

export const StorageService = {
  getSessions(): StudySession[] {
    try {
      const data = safeParse<StudySession[]>(localStorage.getItem(SESSIONS_KEY), []);
      if (!Array.isArray(data)) return [];
      // Clean and validate session items
      return data.filter(s => s && typeof s.id === 'string' && typeof s.durationMs === 'number');
    } catch {
      return [];
    }
  },

  saveSessions(sessions: StudySession[]): boolean {
    return safeSet(SESSIONS_KEY, sessions);
  },

  addSession(session: StudySession): StudySession[] {
    const existing = this.getSessions();
    // Prepend newer sessions to the beginning
    const updated = [session, ...existing.filter(s => s.id !== session.id)];
    this.saveSessions(updated);
    return updated;
  },

  deleteSession(sessionId: string): StudySession[] {
    const existing = this.getSessions();
    const updated = existing.filter(s => s.id !== sessionId);
    this.saveSessions(updated);
    return updated;
  },

  updateSession(session: StudySession): StudySession[] {
    const existing = this.getSessions();
    const updated = existing.map(s => s.id === session.id ? session : s);
    this.saveSessions(updated);
    return updated;
  },

  getActiveSession(): ActiveSessionState {
    try {
      const saved = safeParse<ActiveSessionState>(localStorage.getItem(ACTIVE_SESSION_KEY), DEFAULT_ACTIVE_SESSION);
      // Validate structure
      if (!saved || typeof saved !== 'object') {
        return { ...DEFAULT_ACTIVE_SESSION };
      }
      return {
        status: saved.status === 'running' || saved.status === 'paused' ? saved.status : 'idle',
        subject: saved.subject || 'DSA',
        sessionStartTime: typeof saved.sessionStartTime === 'number' ? saved.sessionStartTime : null,
        currentIntervalStart: typeof saved.currentIntervalStart === 'number' ? saved.currentIntervalStart : null,
        accumulatedMs: typeof saved.accumulatedMs === 'number' ? Math.max(0, saved.accumulatedMs) : 0,
        intervals: Array.isArray(saved.intervals) ? saved.intervals : [],
        notes: saved.notes || '',
        lastHeartbeat: typeof saved.lastHeartbeat === 'number' ? saved.lastHeartbeat : undefined,
      };
    } catch {
      return { ...DEFAULT_ACTIVE_SESSION };
    }
  },

  saveActiveSession(state: ActiveSessionState): boolean {
    return safeSet(ACTIVE_SESSION_KEY, state);
  },

  clearActiveSession(): void {
    safeSet(ACTIVE_SESSION_KEY, DEFAULT_ACTIVE_SESSION);
  },

  getSettings(): UserSettings {
    try {
      const saved = safeParse<Partial<UserSettings>>(localStorage.getItem(SETTINGS_KEY), {});
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: UserSettings): boolean {
    return safeSet(SETTINGS_KEY, settings);
  },

  getSubjects(): string[] {
    try {
      const data = safeParse<string[]>(localStorage.getItem(SUBJECTS_KEY), DEFAULT_SUBJECTS);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return [...DEFAULT_SUBJECTS];
    } catch {
      return [...DEFAULT_SUBJECTS];
    }
  },

  saveSubjects(subjects: string[]): boolean {
    return safeSet(SUBJECTS_KEY, subjects);
  },

  addSubject(subject: string): string[] {
    const trimmed = subject.trim();
    if (!trimmed) return this.getSubjects();
    const current = this.getSubjects();
    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed];
      this.saveSubjects(updated);
      return updated;
    }
    return current;
  },

  deleteSubject(subject: string): string[] {
    const current = this.getSubjects();
    const updated = current.filter(s => s !== subject);
    // Keep at least one subject
    const finalSubjects = updated.length > 0 ? updated : ['Other'];
    this.saveSubjects(finalSubjects);
    return finalSubjects;
  },

  resetSubjects(): string[] {
    this.saveSubjects(DEFAULT_SUBJECTS);
    return [...DEFAULT_SUBJECTS];
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(SUBJECTS_KEY);
    } catch (e) {
      console.error('StudyFlow: Failed to clear data', e);
    }
  },

  exportBackupJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sessions: this.getSessions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return { success: false, error: 'Invalid file format: missing sessions array' };
      }
      const existing = this.getSessions();
      const existingIds = new Set(existing.map(s => s.id));
      const newSessions: StudySession[] = [];

      for (const s of parsed.sessions) {
        if (s && s.id && typeof s.durationMs === 'number' && !existingIds.has(s.id)) {
          newSessions.push(s);
        }
      }

      const merged = [...newSessions, ...existing];
      // Sort descending by endTime
      merged.sort((a, b) => b.endTime - a.endTime);
      this.saveSessions(merged);

      if (parsed.settings && typeof parsed.settings.dailyGoalMinutes === 'number') {
        this.saveSettings({
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
        });
      }

      return { success: true, count: newSessions.length };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown parse error';
      return { success: false, error: msg };
    }
  }
};
