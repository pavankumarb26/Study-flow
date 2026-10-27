import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatHHMMSS } from '../../utils/formatters';
import {
  LayoutDashboard,
  History,
  Settings,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'history' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeSession, currentElapsedMs } = useStudy();
  const isStudying = activeSession.status === 'running';
  const isPaused = activeSession.status === 'paused';

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as const, label: 'History & Logs', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950/70 border-r border-slate-800/80 p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
          <Clock className="w-5 h-5" />
          {isStudying && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
          )}
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            StudyFlow
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              PRO
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Deep Work Productivity</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600/15 border border-brand-500/30 text-brand-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Active Timer Widget in Sidebar when not on dashboard */}
      {(isStudying || isPaused) && currentTab !== 'dashboard' && (
        <div
          onClick={() => onSelectTab('dashboard')}
          className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-brand-500/30 shadow-lg cursor-pointer hover:border-brand-500 transition-colors group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-brand-300">
              <span className={`w-2 h-2 rounded-full ${isStudying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isStudying ? 'Studying...' : 'Paused'}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Return &rarr;</span>
          </div>
          <div className="font-mono font-bold text-lg text-white">
            {formatHHMMSS(currentElapsedMs)}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            Subject: <strong className="text-slate-300">{activeSession.subject}</strong>
          </div>
        </div>
      )}

      {/* Productivity Motivation Quote / Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5 text-brand-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Daily Focus
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          &ldquo;Focus is a muscle. The more you protect uninterrupted time, the stronger it gets.&rdquo;
        </p>
      </div>
    </aside>
  );
};
