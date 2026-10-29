import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatHHMMSS, formatDurationHuman } from '../../utils/formatters';
import { Header } from '../layout/Header';
import { StudyTimer } from '../timer/StudyTimer';
import { StatCard } from './StatCard';
import { GoalProgressBar } from './GoalProgressBar';
import { WeeklyBarChart } from './WeeklyBarChart';
import { SubjectBreakdownChart } from './SubjectBreakdownChart';
import { RecentSessionsList } from './RecentSessionsList';
import { Clock, CalendarDays, Award, Sparkles, X } from 'lucide-react';

interface DashboardViewProps {
  onNavigateHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateHistory }) => {
  const { todayStudyTimeMs, weekStudyTimeMs, monthStudyTimeMs, rolloverNotice, clearRolloverNotice } = useStudy();

  return (
    <div className="space-y-6">
      {/* Top Greeting and Today's Date */}
      <Header />

      {/* New Day Auto-Saved Banner */}
      {rolloverNotice && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-sm shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="font-medium text-slate-100">{rolloverNotice}</span>
          </div>
          <button
            type="button"
            onClick={clearRolloverNotice}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Focus Study Timer */}
      <section aria-label="Study Timer">
        <StudyTimer />
      </section>

      {/* Primary Aggregate Statistics & Goal Progress */}
      <section aria-label="Study Metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Total */}
        <StatCard
          title="Today's Study Time"
          formattedTime={formatHHMMSS(todayStudyTimeMs)}
          subtitle={todayStudyTimeMs > 0 ? `${formatDurationHuman(todayStudyTimeMs)} of deep focus` : 'Start studying today'}
          icon={Clock}
          accentColor="indigo"
          badgeText="Daily Total"
        />

        {/* This Week's Total */}
        <StatCard
          title="This Week's Time"
          formattedTime={formatHHMMSS(weekStudyTimeMs)}
          subtitle={`${formatDurationHuman(weekStudyTimeMs)} Mon – Sun`}
          icon={CalendarDays}
          accentColor="violet"
          badgeText="Weekly"
        />

        {/* This Month's Total */}
        <StatCard
          title="This Month's Time"
          formattedTime={formatHHMMSS(monthStudyTimeMs)}
          subtitle={`${formatDurationHuman(monthStudyTimeMs)} this calendar month`}
          icon={Award}
          accentColor="cyan"
          badgeText="Monthly"
        />

        {/* Daily Goal Indicator */}
        <GoalProgressBar />
      </section>

      {/* Charts Row: 7-Day Bar Chart & Subject Breakdown */}
      <section aria-label="Study Analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WeeklyBarChart />
        <SubjectBreakdownChart />
      </section>

      {/* Recent Study Sessions */}
      <section aria-label="Recent Study Sessions">
        <RecentSessionsList onViewAll={onNavigateHistory} />
      </section>
    </div>
  );
};
