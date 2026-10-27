import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  formattedTime: string;
  subtitle: string;
  icon: LucideIcon;
  accentColor?: 'indigo' | 'violet' | 'emerald' | 'cyan';
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  formattedTime,
  subtitle,
  icon: Icon,
  accentColor = 'indigo',
  badgeText,
}) => {
  const accentStyles = {
    indigo: {
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
      text: 'text-brand-400',
      glow: 'group-hover:border-brand-500/40',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      glow: 'group-hover:border-violet-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/40',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'group-hover:border-cyan-500/40',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <div
      className={`group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card hover:bg-slate-900 transition-all duration-300 ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
            {formattedTime}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`p-2.5 rounded-xl border ${style.bg} ${style.border} ${style.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          {badgeText && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
