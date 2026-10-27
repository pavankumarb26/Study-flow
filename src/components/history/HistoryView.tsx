import React, { useState, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { StudySession } from '../../types/study';
import {
  formatDurationHuman,
  formatTimeOfDay,
  formatDateShort,
} from '../../utils/formatters';
import { getDayBoundaries } from '../../utils/dateUtils';
import { SubjectBadge } from '../common/Badge';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ManualSessionModal } from './ManualSessionModal';
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  Plus,
  BookOpen,
  Clock,
  BarChart2,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { sessions, deleteSession } = useStudy();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Extract unique subjects from sessions
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => set.add(s.subject));
    return Array.from(set);
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let minTime = 0;
    let maxTime = Infinity;

    if (dateFilter === 'today') {
      const { dayStart, dayEnd } = getDayBoundaries(now);
      minTime = dayStart;
      maxTime = dayEnd;
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      minTime = sevenDaysAgo.getTime();
      maxTime = now.getTime();
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      minTime = thirtyDaysAgo.getTime();
      maxTime = now.getTime();
    } else if (dateFilter === 'custom') {
      if (customStartDate) {
        minTime = getDayBoundaries(customStartDate).dayStart;
      }
      if (customEndDate) {
        maxTime = getDayBoundaries(customEndDate).dayEnd;
      }
    }

    return sessions.filter((s) => {
      // Date filter (session started or ended within range)
      if (s.endTime < minTime || s.startTime > maxTime) {
        return false;
      }

      // Subject filter
      if (subjectFilter !== 'ALL' && s.subject !== subjectFilter) {
        return false;
      }

      // Search query (search in notes or subject)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = s.subject.toLowerCase().includes(q);
        const matchesNotes = s.notes ? s.notes.toLowerCase().includes(q) : false;
        if (!matchesSubject && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, dateFilter, customStartDate, customEndDate, subjectFilter, searchQuery]);

  // Summary stats for filtered view
  const filteredTotalMs = useMemo(() => {
    return filteredSessions.reduce((acc, curr) => acc + curr.durationMs, 0);
  }, [filteredSessions]);

  const avgSessionMs = filteredSessions.length > 0 ? Math.round(filteredTotalMs / filteredSessions.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Study History</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, filter, and manage your complete historical study logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Past Study</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500 appearance-none"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Preset */}
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500 appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers */}
        {dateFilter === 'custom' && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-xs text-brand-400 hover:underline"
              >
                Reset Dates
              </button>
            )}
          </div>
        )}

        {/* Filter Summary Stats Pill Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>Total Filtered Time:</span>
            <strong className="text-slate-100 font-mono">
              {formatDurationHuman(filteredTotalMs)}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Sessions:</span>
            <strong className="text-slate-100 font-mono">
              {filteredSessions.length}
            </strong>
          </div>
          {filteredSessions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span>Avg Duration:</span>
              <strong className="text-slate-100 font-mono">
                {formatDurationHuman(avgSessionMs)}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">No sessions match your filter</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {sessions.length === 0
                ? 'No study sessions recorded yet. Start studying from the dashboard to track your progress.'
                : 'Try adjusting your subject or date filter criteria above.'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card hover:border-slate-700/80 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="pt-0.5">
                  <SubjectBadge subject={session.subject} size="md" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {formatDateShort(session.startTime)}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {formatTimeOfDay(session.startTime)} – {formatTimeOfDay(session.endTime)}
                    </span>
                    {session.intervals && session.intervals.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700/50">
                        {session.intervals.length} intervals
                      </span>
                    )}
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      {session.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                    Duration
                  </span>
                  <span className="font-mono font-bold text-base sm:text-lg text-white">
                    {formatDurationHuman(session.durationMs)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSessionToDelete(session)}
                  title="Delete Session"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        session={sessionToDelete}
        isOpen={sessionToDelete !== null}
        onClose={() => setSessionToDelete(null)}
        onConfirm={(id) => deleteSession(id)}
      />

      {/* Manual Session Add Modal */}
      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
