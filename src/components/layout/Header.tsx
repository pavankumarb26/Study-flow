import React, { useState, useEffect } from 'react';
import { getGreeting } from '../../utils/formatters';
import { Calendar, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update clock and greeting every 60 seconds
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = getGreeting(currentDate);
  const formattedFullDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/80 mb-6">
      <div>
        <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Productivity Dashboard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {greeting}!
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Ready to achieve focused deep work today?
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm">
        <Calendar className="w-3.5 h-3.5 text-brand-400" />
        <span className="font-medium">{formattedFullDate}</span>
      </div>
    </div>
  );
};
