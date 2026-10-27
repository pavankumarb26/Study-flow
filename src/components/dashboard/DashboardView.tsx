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
import { Clock, CalendarDays, Award } from 'lucide-react';

interface DashboardViewProps {
  onNavigateHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateHistory }) => {
  const { todayStudyTimeMs, weekStudyTimeMs, monthStudyTimeMs } = useStudy();

  return (
    <div className="space-y-6">
      {/* Top Greeting and Today's Date */}
      <Header />

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
