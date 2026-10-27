import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDurationHuman } from '../../utils/formatters';
import { Target, Edit3, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export const GoalProgressBar: React.FC = () => {
  const { todayStudyTimeMs, settings, updateSettings } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [goalHoursInput, setGoalHoursInput] = useState<string>(
    (settings.dailyGoalMinutes / 60).toString()
  );

  const goalMs = settings.dailyGoalMinutes * 60 * 1000;
  const percentage = Math.min(100, Math.round((todayStudyTimeMs / Math.max(1, goalMs)) * 100));
  const isGoalAchieved = todayStudyTimeMs >= goalMs && goalMs > 0;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(goalHoursInput);
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      updateSettings({ dailyGoalMinutes: Math.round(hours * 60) });
      setIsEditing(false);
    }
  };

  const handleOpenEdit = () => {
    setGoalHoursInput((settings.dailyGoalMinutes / 60).toString());
    setIsEditing(true);
  };

  return (
    <>
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Daily Study Goal
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGoalAchieved ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Goal Reached!
              </span>
            ) : (
              <span className="text-xs font-mono font-medium text-slate-400">
                {percentage}%
              </span>
            )}

            <button
              type="button"
              onClick={handleOpenEdit}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Edit daily goal"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalAchieved
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Subtext with human durations */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>
            Current:{' '}
            <strong className="text-slate-200 font-mono">
              {formatDurationHuman(todayStudyTimeMs)}
            </strong>
          </span>
          <span>
            Target:{' '}
            <strong className="text-slate-200 font-mono">
              {formatDurationHuman(goalMs)}
            </strong>
          </span>
        </div>
      </div>

      {/* Edit Daily Goal Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Set Daily Study Goal"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Daily Target (Hours)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={goalHoursInput}
                onChange={(e) => setGoalHoursInput(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                hours/day
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Recommended: 2.0 to 4.0 hours of focused deep study per day.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
