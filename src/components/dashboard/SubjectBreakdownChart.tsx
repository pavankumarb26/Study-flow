import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useStudy } from '../../context/StudyContext';
import { formatDurationHuman } from '../../utils/formatters';
import { PieChart as PieChartIcon } from 'lucide-react';

interface TooltipPayloadItem {
  value: number;
  payload: {
    subject: string;
    durationMs: number;
    percentage: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-slate-200">{data.subject}</p>
        <p className="mt-1 text-brand-400 font-mono font-medium">
          {formatDurationHuman(data.durationMs)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const SubjectBreakdownChart: React.FC = () => {
  const { subjectBreakdown } = useStudy();

  const hasData = subjectBreakdown.length > 0;
  const totalDurationMs = subjectBreakdown.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              Subject Distribution
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {subjectBreakdown.length} Subject{subjectBreakdown.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          All-time tracked: <strong className="text-slate-200 font-mono">{formatDurationHuman(totalDurationMs)}</strong>
        </p>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-2">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-300">No subject data yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete a study session to see your subject breakdown.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          {/* Donut Chart */}
          <div className="h-44 w-44 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectBreakdown}
                  dataKey="durationMs"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  stroke="none"
                >
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {formatDurationHuman(totalDurationMs)}
              </span>
            </div>
          </div>

          {/* Legend and percentage list */}
          <div className="flex-1 w-full space-y-2 max-h-44 overflow-y-auto pr-1">
            {subjectBreakdown.map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300 truncate font-medium">{item.subject}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-slate-400">
                    {formatDurationHuman(item.durationMs)}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: `${item.color}18`, color: item.color }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
