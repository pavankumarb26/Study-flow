import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useStudy } from '../../context/StudyContext';
import { formatDurationHuman } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

interface TooltipPayloadItem {
  value: number;
  payload: {
    dayName: string;
    formattedDate: string;
    durationMs: number;
    durationMinutes: number;
    sessionCount: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-slate-200">
          {data.dayName}, {data.formattedDate}
        </p>
        <p className="mt-1 text-brand-400 font-mono font-medium">
          Study Time: {formatDurationHuman(data.durationMs)}
        </p>
        {data.sessionCount > 0 && (
          <p className="mt-0.5 text-slate-400">
            {data.sessionCount} session{data.sessionCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const WeeklyBarChart: React.FC = () => {
  const { last7DaysSummary } = useStudy();

  const totalWeekMs = last7DaysSummary.reduce((acc, curr) => acc + curr.durationMs, 0);
  const maxDayHours = Math.max(...last7DaysSummary.map((d) => d.durationHours), 1);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              Daily Study Activity
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Last 7 Days
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Total active: <strong className="text-slate-200 font-mono">{formatDurationHuman(totalWeekMs)}</strong>
        </p>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7DaysSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="dayName"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(maxDayHours * 1.2)]}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
            <Bar dataKey="durationHours" radius={[6, 6, 0, 0]} maxBarSize={38}>
              {last7DaysSummary.map((entry, index) => {
                const isToday = index === last7DaysSummary.length - 1;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isToday ? '#6366F1' : entry.durationMs > 0 ? '#4F46E5' : '#1E293B'}
                    opacity={entry.durationMs > 0 ? 1 : 0.6}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
