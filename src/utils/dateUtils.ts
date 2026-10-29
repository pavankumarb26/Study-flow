import { StudyInterval, StudySession, ActiveSessionState, DayStudySummary, SubjectStudySummary } from '../types/study';
import { formatDurationHuman } from './formatters';

/**
 * Returns 'YYYY-MM-DD' for a given Date in local time.
 */
export function formatLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses 'YYYY-MM-DD' into local Date at 00:00:00.
 */
export function parseLocalDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns [startOfDayMs, endOfDayMs] for a local date string or Date object.
 */
export function getDayBoundaries(dateOrStr: Date | string = new Date()): { dayStart: number; dayEnd: number } {
  let d: Date;
  if (typeof dateOrStr === 'string') {
    d = parseLocalDateKey(dateOrStr);
  } else {
    d = new Date(dateOrStr.getFullYear(), dateOrStr.getMonth(), dateOrStr.getDate(), 0, 0, 0, 0);
  }

  const dayStart = d.getTime();
  // Continuous boundary to next midnight (00:00:00.000) so no milliseconds are lost
  const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  const dayEnd = nextDay.getTime();

  return { dayStart, dayEnd };
}

/**
 * Calculates how many active milliseconds of a given interval falls within [rangeStart, rangeEnd].
 */
export function getIntervalOverlapMs(
  interval: StudyInterval,
  rangeStart: number,
  rangeEnd: number
): number {
  if (interval.end <= rangeStart || interval.start >= rangeEnd) {
    return 0;
  }
  const overlapStart = Math.max(interval.start, rangeStart);
  const overlapEnd = Math.min(interval.end, rangeEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Calculates active duration of a session that falls within a given time range [rangeStart, rangeEnd].
 * Handles midnight crossing and paused intervals perfectly.
 */
export function getSessionActiveMsInRange(
  session: StudySession,
  rangeStart: number,
  rangeEnd: number
): number {
  // If intervals are preserved, sum their overlaps
  if (session.intervals && session.intervals.length > 0) {
    return session.intervals.reduce((total, interval) => {
      return total + getIntervalOverlapMs(interval, rangeStart, rangeEnd);
    }, 0);
  }

  // Fallback for sessions without interval breakdowns
  if (session.endTime <= rangeStart || session.startTime >= rangeEnd) {
    return 0;
  }
  const overlapStart = Math.max(session.startTime, rangeStart);
  const overlapEnd = Math.min(session.endTime, rangeEnd);
  const rawOverlap = Math.max(0, overlapEnd - overlapStart);
  const totalRawDuration = Math.max(1, session.endTime - session.startTime);
  const ratio = Math.min(1, rawOverlap / totalRawDuration);
  return Math.round(session.durationMs * ratio);
}

/**
 * Returns all active intervals for an active session state right now.
 * Includes completed intervals plus the currently open interval if running.
 */
export function getActiveSessionCurrentIntervals(
  activeSession: ActiveSessionState,
  nowMs: number = Date.now()
): StudyInterval[] {
  const result: StudyInterval[] = [...activeSession.intervals];
  if (activeSession.status === 'running' && activeSession.currentIntervalStart !== null) {
    if (nowMs > activeSession.currentIntervalStart) {
      result.push({
        start: activeSession.currentIntervalStart,
        end: nowMs,
      });
    }
  }
  return result;
}

/**
 * Calculates active study duration in a time range for the current in-progress session.
 */
export function getActiveSessionOverlapMs(
  activeSession: ActiveSessionState | null,
  rangeStart: number,
  rangeEnd: number,
  nowMs: number = Date.now()
): number {
  if (!activeSession || activeSession.status === 'idle') return 0;
  const intervals = getActiveSessionCurrentIntervals(activeSession, nowMs);
  return intervals.reduce((sum, interval) => {
    return sum + getIntervalOverlapMs(interval, rangeStart, rangeEnd);
  }, 0);
}

/**
 * Computes today's total study duration in ms (local time 00:00:00 to 23:59:59.999).
 * Includes both saved sessions and ongoing session active overlap.
 */
export function getTodayStudyTimeMs(
  sessions: StudySession[],
  activeSession: ActiveSessionState | null,
  now: Date = new Date()
): number {
  const { dayStart, dayEnd } = getDayBoundaries(now);
  const nowMs = now.getTime();

  let total = 0;
  for (const s of sessions) {
    total += getSessionActiveMsInRange(s, dayStart, dayEnd);
  }

  if (activeSession && activeSession.status !== 'idle') {
    total += getActiveSessionOverlapMs(activeSession, dayStart, dayEnd, nowMs);
  }

  return total;
}

/**
 * Computes this week's total study duration in ms (Monday to Sunday, or local week).
 */
export function getWeekStudyTimeMs(
  sessions: StudySession[],
  activeSession: ActiveSessionState | null,
  now: Date = new Date()
): number {
  // Start of week: Monday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7; // days since Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
  const weekStart = monday.getTime();

  // End of week: next Monday 00:00:00 continuous boundary
  const nextMonday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7, 0, 0, 0, 0);
  const weekEnd = nextMonday.getTime();
  const nowMs = now.getTime();

  let total = 0;
  for (const s of sessions) {
    total += getSessionActiveMsInRange(s, weekStart, weekEnd);
  }

  if (activeSession && activeSession.status !== 'idle') {
    total += getActiveSessionOverlapMs(activeSession, weekStart, weekEnd, nowMs);
  }

  return total;
}

/**
 * Computes this month's total study duration in ms (1st of month to last day of month).
 */
export function getMonthStudyTimeMs(
  sessions: StudySession[],
  activeSession: ActiveSessionState | null,
  now: Date = new Date()
): number {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime();
  const monthEnd = nextMonthStart;
  const nowMs = now.getTime();

  let total = 0;
  for (const s of sessions) {
    total += getSessionActiveMsInRange(s, monthStart, monthEnd);
  }

  if (activeSession && activeSession.status !== 'idle') {
    total += getActiveSessionOverlapMs(activeSession, monthStart, monthEnd, nowMs);
  }

  return total;
}

/**
 * Computes daily study summary for the last 7 days (including today).
 */
export function getLast7DaysSummary(
  sessions: StudySession[],
  activeSession: ActiveSessionState | null,
  referenceDate: Date = new Date()
): DayStudySummary[] {
  const days: DayStudySummary[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nowMs = referenceDate.getTime();

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - i,
      0, 0, 0, 0
    );
    const dateStr = formatLocalDateKey(targetDate);
    const { dayStart, dayEnd } = getDayBoundaries(targetDate);

    let durationMs = 0;
    let sessionCount = 0;

    for (const s of sessions) {
      const ms = getSessionActiveMsInRange(s, dayStart, dayEnd);
      if (ms > 0) {
        durationMs += ms;
        sessionCount++;
      }
    }

    if (activeSession && activeSession.status !== 'idle') {
      const ms = getActiveSessionOverlapMs(activeSession, dayStart, dayEnd, nowMs);
      if (ms > 0) {
        durationMs += ms;
      }
    }

    const durationMinutes = Math.round(durationMs / 60000);
    const durationHours = Number((durationMs / 3600000).toFixed(2));

    days.push({
      dateStr,
      dayName: dayNames[targetDate.getDay()],
      formattedDate: `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}`,
      durationMs,
      durationMinutes,
      durationHours,
      sessionCount,
    });
  }

  return days;
}

/**
 * Subject colors dictionary and generator.
 */
export const SUBJECT_COLORS: Record<string, string> = {
  'DSA': '#6366F1',             // Indigo
  'AI/ML': '#8B5CF6',           // Violet
  'RAG & LLMs': '#06B6D4',      // Cyan
  'College Subjects': '#10B981',// Emerald
  'Other': '#F59E0B',           // Amber
};

const EXTRA_PALETTE = [
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#A855F7', // Purple
  '#EAB308', // Yellow
];

export function getSubjectColor(subject: string): string {
  if (SUBJECT_COLORS[subject]) {
    return SUBJECT_COLORS[subject];
  }
  // Deterministic color from string hash
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % EXTRA_PALETTE.length;
  return EXTRA_PALETTE[index];
}

/**
 * Computes subject breakdown across sessions (optionally bounded by time range).
 */
export function getSubjectBreakdown(
  sessions: StudySession[],
  activeSession: ActiveSessionState | null,
  rangeStart?: number,
  rangeEnd?: number,
  nowMs: number = Date.now()
): SubjectStudySummary[] {
  const subjectMap = new Map<string, number>();

  for (const s of sessions) {
    const ms = (rangeStart !== undefined && rangeEnd !== undefined)
      ? getSessionActiveMsInRange(s, rangeStart, rangeEnd)
      : s.durationMs;

    if (ms > 0) {
      subjectMap.set(s.subject, (subjectMap.get(s.subject) || 0) + ms);
    }
  }

  if (activeSession && activeSession.status !== 'idle') {
    const ms = (rangeStart !== undefined && rangeEnd !== undefined)
      ? getActiveSessionOverlapMs(activeSession, rangeStart, rangeEnd, nowMs)
      : (activeSession.accumulatedMs + (activeSession.status === 'running' && activeSession.currentIntervalStart ? Math.max(0, nowMs - activeSession.currentIntervalStart) : 0));

    if (ms > 0) {
      subjectMap.set(activeSession.subject, (subjectMap.get(activeSession.subject) || 0) + ms);
    }
  }

  const totalAllMs = Array.from(subjectMap.values()).reduce((a, b) => a + b, 0);

  const results: SubjectStudySummary[] = Array.from(subjectMap.entries()).map(([subject, durationMs]) => {
    const durationMinutes = Math.round(durationMs / 60000);
    const durationHours = Number((durationMs / 3600000).toFixed(2));
    const percentage = totalAllMs > 0 ? Number(((durationMs / totalAllMs) * 100).toFixed(1)) : 0;

    return {
      subject,
      durationMs,
      durationMinutes,
      durationHours,
      percentage,
      color: getSubjectColor(subject),
    };
  });

  // Sort descending by duration
  return results.sort((a, b) => b.durationMs - a.durationMs);
}

export interface RolloverResult {
  hasRolledOver: boolean;
  archivedSessions: StudySession[];
  newActiveSession: ActiveSessionState;
  newElapsedMs: number;
  rolloverNotice?: string;
}

/**
 * Checks if an active session belongs to a previous day (or spans across midnight).
 * If so, automatically archives completed active time for previous day(s) into history,
 * and resets or starts a fresh active session for the new day starting from 00:00:00.
 */
export function processDailyRollover(
  activeSession: ActiveSessionState,
  now: Date = new Date()
): RolloverResult {
  const nowMs = now.getTime();
  const todayKey = formatLocalDateKey(now);
  const { dayStart: todayStartMs } = getDayBoundaries(now);

  // If idle or no start time, ensure clean idle state
  if (activeSession.status === 'idle' || !activeSession.sessionStartTime) {
    return {
      hasRolledOver: false,
      archivedSessions: [],
      newActiveSession: activeSession,
      newElapsedMs: 0,
    };
  }

  const sessionStartKey = formatLocalDateKey(new Date(activeSession.sessionStartTime));

  // If started today, no daily rollover needed
  if (sessionStartKey === todayKey) {
    const elapsed = activeSession.status === 'running' && activeSession.currentIntervalStart !== null
      ? activeSession.accumulatedMs + Math.max(0, nowMs - activeSession.currentIntervalStart)
      : activeSession.accumulatedMs;
    return {
      hasRolledOver: false,
      archivedSessions: [],
      newActiveSession: activeSession,
      newElapsedMs: elapsed,
    };
  }

  // Session was started on a previous day!
  const archivedSessions: StudySession[] = [];
  const sessionDayEnd = getDayBoundaries(new Date(activeSession.sessionStartTime)).dayEnd;

  if (activeSession.status === 'paused') {
    const durationMs = activeSession.accumulatedMs;
    const lastIntervalEnd = activeSession.intervals.length > 0
      ? activeSession.intervals[activeSession.intervals.length - 1].end
      : (activeSession.lastHeartbeat || (activeSession.sessionStartTime + durationMs));

    const effectiveEndTime = Math.min(lastIntervalEnd, sessionDayEnd);

    if (durationMs >= 5000) {
      archivedSessions.push({
        id: `session_${activeSession.sessionStartTime}_${Math.random().toString(36).substring(2, 8)}`,
        subject: activeSession.subject || 'DSA',
        startTime: activeSession.sessionStartTime,
        endTime: effectiveEndTime,
        durationMs,
        intervals: activeSession.intervals.length > 0
          ? activeSession.intervals
          : [{ start: activeSession.sessionStartTime, end: effectiveEndTime }],
        notes: activeSession.notes
          ? `${activeSession.notes} (Completed on ${sessionStartKey})`
          : `Session from ${sessionStartKey}`,
        createdAt: effectiveEndTime,
      });
    }

    const newActive: ActiveSessionState = {
      status: 'idle',
      subject: activeSession.subject || 'DSA',
      sessionStartTime: null,
      currentIntervalStart: null,
      accumulatedMs: 0,
      intervals: [],
      notes: '',
      lastHeartbeat: undefined,
    };

    return {
      hasRolledOver: true,
      archivedSessions,
      newActiveSession: newActive,
      newElapsedMs: 0,
      rolloverNotice: durationMs >= 5000
        ? `New day started! Yesterday's session (${formatDurationHuman(durationMs)}) was saved to History. Timer has reset to 00:00:00.`
        : `New day started! Timer has reset to 00:00:00.`,
    };
  }

  // Status is 'running'
  if (activeSession.status === 'running') {
    const prevIntervals: StudyInterval[] = [];

    for (const inv of activeSession.intervals) {
      if (inv.end <= todayStartMs) {
        prevIntervals.push(inv);
      } else if (inv.start < todayStartMs) {
        prevIntervals.push({ start: inv.start, end: todayStartMs });
      }
    }

    const currentIntStart = activeSession.currentIntervalStart || activeSession.sessionStartTime;
    const isLiveMidnight = (nowMs - todayStartMs) < 120000; // within 2 minutes of midnight live

    if (currentIntStart < todayStartMs) {
      const prevEnd = isLiveMidnight
        ? todayStartMs
        : (activeSession.lastHeartbeat
            ? Math.min(activeSession.lastHeartbeat, todayStartMs)
            : todayStartMs);

      if (prevEnd > currentIntStart) {
        prevIntervals.push({ start: currentIntStart, end: prevEnd });
      }
    }

    const prevDurationMs = prevIntervals.reduce((sum, inv) => sum + Math.max(0, inv.end - inv.start), 0);

    if (prevDurationMs >= 5000) {
      archivedSessions.push({
        id: `session_${activeSession.sessionStartTime}_${Math.random().toString(36).substring(2, 8)}`,
        subject: activeSession.subject || 'DSA',
        startTime: activeSession.sessionStartTime,
        endTime: todayStartMs,
        durationMs: prevDurationMs,
        intervals: prevIntervals,
        notes: activeSession.notes
          ? `${activeSession.notes} (Completed at midnight)`
          : `Session up to midnight (${sessionStartKey})`,
        createdAt: todayStartMs,
      });
    }

    if (isLiveMidnight) {
      // Actively studying across midnight - continue running from 00:00:00 for today
      const newActive: ActiveSessionState = {
        status: 'running',
        subject: activeSession.subject || 'DSA',
        sessionStartTime: todayStartMs,
        currentIntervalStart: todayStartMs,
        accumulatedMs: 0,
        intervals: [],
        notes: activeSession.notes || '',
        lastHeartbeat: nowMs,
      };

      return {
        hasRolledOver: true,
        archivedSessions,
        newActiveSession: newActive,
        newElapsedMs: Math.max(0, nowMs - todayStartMs),
        rolloverNotice: `Midnight reached! Yesterday's time was saved to History. Today's timer started from 00:00:00.`,
      };
    } else {
      // Closed yesterday while running and reopened today -> idle at 00:00:00
      const newActive: ActiveSessionState = {
        status: 'idle',
        subject: activeSession.subject || 'DSA',
        sessionStartTime: null,
        currentIntervalStart: null,
        accumulatedMs: 0,
        intervals: [],
        notes: '',
        lastHeartbeat: undefined,
      };

      return {
        hasRolledOver: true,
        archivedSessions,
        newActiveSession: newActive,
        newElapsedMs: 0,
        rolloverNotice: prevDurationMs >= 5000
          ? `New day started! Yesterday's session (${formatDurationHuman(prevDurationMs)}) was saved to History. Timer is ready at 00:00:00.`
          : `New day started! Timer has reset to 00:00:00.`,
      };
    }
  }

  return {
    hasRolledOver: false,
    archivedSessions: [],
    newActiveSession: activeSession,
    newElapsedMs: 0,
  };
}
