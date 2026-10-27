import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  StudySession,
  ActiveSessionState,
  UserSettings,
  DayStudySummary,
  SubjectStudySummary,
} from '../types/study';
import {
  StorageService,
  DEFAULT_SETTINGS,
  DEFAULT_ACTIVE_SESSION,
} from '../utils/storage';
import {
  formatLocalDateKey,
  getTodayStudyTimeMs,
  getWeekStudyTimeMs,
  getMonthStudyTimeMs,
  getLast7DaysSummary,
  getSubjectBreakdown,
} from '../utils/dateUtils';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';

interface StudyContextType {
  // Active session
  activeSession: ActiveSessionState;
  currentElapsedMs: number;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  sessionNotes: string;
  setSessionNotes: (notes: string) => void;

  // Timer controls
  startTimer: (subject?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishTimer: (notes?: string) => StudySession | null;
  discardTimer: () => void;

  // History & sessions
  sessions: StudySession[];
  deleteSession: (id: string) => void;
  addManualSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  updateSession: (session: StudySession) => void;

  // Subjects management
  subjects: string[];
  addSubject: (name: string) => void;
  deleteSubject: (name: string) => void;
  resetSubjects: () => void;
  changeActiveSessionSubject: (newSubject: string) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (json: string) => { success: boolean; count?: number; error?: string };

  // Aggregated live statistics
  todayStudyTimeMs: number;
  weekStudyTimeMs: number;
  monthStudyTimeMs: number;
  last7DaysSummary: DayStudySummary[];
  subjectBreakdown: SubjectStudySummary[];
  recentSessions: StudySession[];

  // Current calendar day state
  currentDateStr: string;
  refreshCalculations: () => void;
}

const StudyContext = createContext<StudyContextType | null>(null);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage
  const [sessions, setSessions] = useState<StudySession[]>(() => StorageService.getSessions());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [activeSession, setActiveSession] = useState<ActiveSessionState>(() => StorageService.getActiveSession());
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const saved = StorageService.getActiveSession();
    return saved.subject || 'DSA';
  });
  const [sessionNotes, setSessionNotes] = useState<string>(() => {
    const saved = StorageService.getActiveSession();
    return saved.notes || '';
  });

  // Dynamic live elapsed time state
  const [currentElapsedMs, setCurrentElapsedMs] = useState<number>(() => {
    const saved = StorageService.getActiveSession();
    if (saved.status === 'running' && saved.currentIntervalStart) {
      return saved.accumulatedMs + Math.max(0, Date.now() - saved.currentIntervalStart);
    }
    return saved.accumulatedMs;
  });

  // Track current local date key for midnight detection
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => formatLocalDateKey());

  // Ticking reference for requestAnimationFrame / interval
  const animationFrameRef = useRef<number | null>(null);

  // Helper to compute live elapsed time from an activeSession state
  const computeLiveElapsed = useCallback((state: ActiveSessionState, nowMs: number = Date.now()): number => {
    if (state.status === 'idle') return 0;
    if (state.status === 'paused') return state.accumulatedMs;
    if (state.status === 'running' && state.currentIntervalStart !== null) {
      return state.accumulatedMs + Math.max(0, nowMs - state.currentIntervalStart);
    }
    return state.accumulatedMs;
  }, []);

  // Sync selectedSubject & notes into activeSession state if changed while idle
  useEffect(() => {
    if (activeSession.status === 'idle') {
      setActiveSession(prev => {
        const updated = { ...prev, subject: selectedSubject, notes: sessionNotes };
        StorageService.saveActiveSession(updated);
        return updated;
      });
    }
  }, [selectedSubject, sessionNotes, activeSession.status]);

  // Main active timer tick loop
  useEffect(() => {
    if (activeSession.status !== 'running') {
      setCurrentElapsedMs(computeLiveElapsed(activeSession));
      return;
    }

    let lastTick = 0;
    const tick = (now: number) => {
      // Throttle state update to ~10 times per second for smooth rendering without overloading React
      if (now - lastTick >= 100) {
        lastTick = now;
        const nowMs = Date.now();
        setCurrentElapsedMs(computeLiveElapsed(activeSession, nowMs));

        // Check if calendar day rolled over
        const todayKey = formatLocalDateKey(new Date(nowMs));
        if (todayKey !== currentDateStr) {
          setCurrentDateStr(todayKey);
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeSession, computeLiveElapsed, currentDateStr]);

  // Page visibility & focus listeners to ensure 100% accuracy after sleep or tab switch
  useEffect(() => {
    const handleReactivation = () => {
      const now = new Date();
      setCurrentDateStr(formatLocalDateKey(now));
      setCurrentElapsedMs(computeLiveElapsed(activeSession, now.getTime()));
    };

    window.addEventListener('focus', handleReactivation);
    document.addEventListener('visibilitychange', handleReactivation);

    // Midnight rollover checker interval every 30 seconds
    const midnightInterval = setInterval(() => {
      const now = new Date();
      const todayKey = formatLocalDateKey(now);
      if (todayKey !== currentDateStr) {
        setCurrentDateStr(todayKey);
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleReactivation);
      document.removeEventListener('visibilitychange', handleReactivation);
      clearInterval(midnightInterval);
    };
  }, [activeSession, computeLiveElapsed, currentDateStr]);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Timer Control Handlers
  const startTimer = useCallback((subjectToUse?: string) => {
    const now = Date.now();
    const finalSubject = subjectToUse || selectedSubject || 'DSA';

    const newState: ActiveSessionState = {
      status: 'running',
      subject: finalSubject,
      sessionStartTime: now,
      currentIntervalStart: now,
      accumulatedMs: 0,
      intervals: [],
      notes: sessionNotes,
    };

    setActiveSession(newState);
    StorageService.saveActiveSession(newState);
    setCurrentElapsedMs(0);

    if (settings.soundEnabled) {
      soundFx.playStart();
    }
  }, [selectedSubject, sessionNotes, settings.soundEnabled]);

  const pauseTimer = useCallback(() => {
    if (activeSession.status !== 'running' || activeSession.currentIntervalStart === null) return;
    const now = Date.now();
    const intervalDuration = Math.max(0, now - activeSession.currentIntervalStart);
    const newAccumulated = activeSession.accumulatedMs + intervalDuration;

    const newIntervals = [
      ...activeSession.intervals,
      { start: activeSession.currentIntervalStart, end: now },
    ];

    const newState: ActiveSessionState = {
      ...activeSession,
      status: 'paused',
      currentIntervalStart: null,
      accumulatedMs: newAccumulated,
      intervals: newIntervals,
    };

    setActiveSession(newState);
    StorageService.saveActiveSession(newState);
    setCurrentElapsedMs(newAccumulated);

    if (settings.soundEnabled) {
      soundFx.playPause();
    }
  }, [activeSession, settings.soundEnabled]);

  const resumeTimer = useCallback(() => {
    if (activeSession.status !== 'paused') return;
    const now = Date.now();

    const newState: ActiveSessionState = {
      ...activeSession,
      status: 'running',
      currentIntervalStart: now,
    };

    setActiveSession(newState);
    StorageService.saveActiveSession(newState);

    if (settings.soundEnabled) {
      soundFx.playStart();
    }
  }, [activeSession, settings.soundEnabled]);

  const finishTimer = useCallback((customNotes?: string): StudySession | null => {
    if (activeSession.status === 'idle') return null;

    const now = Date.now();
    let finalIntervals = [...activeSession.intervals];
    let totalDurationMs = activeSession.accumulatedMs;

    if (activeSession.status === 'running' && activeSession.currentIntervalStart !== null) {
      const activeDelta = Math.max(0, now - activeSession.currentIntervalStart);
      totalDurationMs += activeDelta;
      finalIntervals.push({
        start: activeSession.currentIntervalStart,
        end: now,
      });
    }

    // Minimum 5 seconds threshold to avoid accidental/empty sessions
    if (totalDurationMs < 5000) {
      alert('Session was too short (under 5 seconds) and was not saved.');
      const idleState: ActiveSessionState = {
        ...DEFAULT_ACTIVE_SESSION,
        subject: selectedSubject,
      };
      setActiveSession(idleState);
      StorageService.clearActiveSession();
      setCurrentElapsedMs(0);
      return null;
    }

    const session: StudySession = {
      id: `session_${now}_${Math.random().toString(36).substring(2, 8)}`,
      subject: activeSession.subject || selectedSubject,
      startTime: activeSession.sessionStartTime || (now - totalDurationMs),
      endTime: now,
      durationMs: totalDurationMs,
      intervals: finalIntervals,
      notes: customNotes !== undefined ? customNotes : sessionNotes,
      createdAt: now,
    };

    // Save session to history
    const updated = StorageService.addSession(session);
    setSessions(updated);

    // Reset active session state
    const idleState: ActiveSessionState = {
      ...DEFAULT_ACTIVE_SESSION,
      subject: selectedSubject,
    };
    setActiveSession(idleState);
    StorageService.clearActiveSession();
    setCurrentElapsedMs(0);
    setSessionNotes('');

    // Audio cue & celebratory confetti
    if (settings.soundEnabled) {
      soundFx.playFinish();
    }
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366F1', '#8B5CF6', '#10B981', '#38BDF8'],
      });
    } catch {
      // Confetti fallback
    }

    return session;
  }, [activeSession, selectedSubject, sessionNotes, settings.soundEnabled]);

  const discardTimer = useCallback(() => {
    const idleState: ActiveSessionState = {
      ...DEFAULT_ACTIVE_SESSION,
      subject: selectedSubject,
    };
    setActiveSession(idleState);
    StorageService.clearActiveSession();
    setCurrentElapsedMs(0);
  }, [selectedSubject]);

  // Session Management
  const deleteSession = useCallback((id: string) => {
    const updated = StorageService.deleteSession(id);
    setSessions(updated);
  }, []);

  const addManualSession = useCallback((newSessionData: Omit<StudySession, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const session: StudySession = {
      ...newSessionData,
      id: `manual_${now}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: now,
    };
    const updated = StorageService.addSession(session);
    setSessions(updated);
  }, []);

  const updateSession = useCallback((session: StudySession) => {
    const updated = StorageService.updateSession(session);
    setSessions(updated);
  }, []);

  // Subjects Management
  const [subjects, setSubjects] = useState<string[]>(() => StorageService.getSubjects());

  const addSubject = useCallback((name: string) => {
    const updated = StorageService.addSubject(name);
    setSubjects(updated);
    setSelectedSubject(name);
  }, []);

  const deleteSubject = useCallback((name: string) => {
    const updated = StorageService.deleteSubject(name);
    setSubjects(updated);
    if (selectedSubject === name) {
      setSelectedSubject(updated[0] || 'DSA');
    }
  }, [selectedSubject]);

  const resetSubjects = useCallback(() => {
    const updated = StorageService.resetSubjects();
    setSubjects(updated);
    setSelectedSubject(updated[0] || 'DSA');
  }, []);

  const changeActiveSessionSubject = useCallback((newSubject: string) => {
    setSelectedSubject(newSubject);
    setActiveSession(prev => {
      const updated = { ...prev, subject: newSubject };
      StorageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  // Settings Handlers
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      StorageService.saveSettings(updated);
      return updated;
    });
  }, []);

  const clearAllData = useCallback(() => {
    StorageService.clearAllData();
    setSessions([]);
    setActiveSession(DEFAULT_ACTIVE_SESSION);
    setSettings(DEFAULT_SETTINGS);
    setCurrentElapsedMs(0);
  }, []);

  const exportData = useCallback((): string => {
    return StorageService.exportBackupJson();
  }, []);

  const importData = useCallback((json: string) => {
    const res = StorageService.importBackupJson(json);
    if (res.success) {
      setSessions(StorageService.getSessions());
      setSettings(StorageService.getSettings());
    }
    return res;
  }, []);

  const refreshCalculations = useCallback(() => {
    setCurrentDateStr(formatLocalDateKey(new Date()));
  }, []);

  // Derived Statistics with live dynamic inclusion
  const now = new Date();
  const todayStudyTimeMs = getTodayStudyTimeMs(sessions, activeSession, now);
  const weekStudyTimeMs = getWeekStudyTimeMs(sessions, activeSession, now);
  const monthStudyTimeMs = getMonthStudyTimeMs(sessions, activeSession, now);
  const last7DaysSummary = getLast7DaysSummary(sessions, activeSession, now);
  const subjectBreakdown = getSubjectBreakdown(sessions, activeSession);
  const recentSessions = sessions.slice(0, 5);

  const value: StudyContextType = {
    activeSession,
    currentElapsedMs,
    selectedSubject,
    setSelectedSubject,
    sessionNotes,
    setSessionNotes,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
    discardTimer,
    sessions,
    deleteSession,
    addManualSession,
    updateSession,
    subjects,
    addSubject,
    deleteSubject,
    resetSubjects,
    changeActiveSessionSubject,
    settings,
    updateSettings,
    clearAllData,
    exportData,
    importData,
    todayStudyTimeMs,
    weekStudyTimeMs,
    monthStudyTimeMs,
    last7DaysSummary,
    subjectBreakdown,
    recentSessions,
    currentDateStr,
    refreshCalculations,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = (): StudyContextType => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
