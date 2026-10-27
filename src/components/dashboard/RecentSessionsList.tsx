import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDurationHuman, formatTimeOfDay, formatSessionDateHeader } from '../../utils/formatters';
import { SubjectBadge } from '../common/Badge';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

interface RecentSessionsListProps {
  onViewAll: () => void;
}

export const RecentSessionsList: React.FC<RecentSessionsListProps> = ({ onViewAll }) => {
  const { recentSessions } = useStudy();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Recent Study Sessions
          </h3>
        </div>

        {recentSessions.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recentSessions.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-300">No sessions recorded yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
            Start the timer above to log your first deep work session.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <SubjectBadge subject={session.subject} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{formatSessionDateHeader(session.startTime)}</span>
                    <span>•</span>
                    <span className="font-mono">
                      {formatTimeOfDay(session.startTime)} – {formatTimeOfDay(session.endTime)}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-xs text-slate-300 truncate mt-0.5 max-w-md">
                      {session.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <span className="font-mono font-bold text-sm text-slate-100">
                  {formatDurationHuman(session.durationMs)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
