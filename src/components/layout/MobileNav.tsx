import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatHHMMSS } from '../../utils/formatters';
import { LayoutDashboard, History, Settings, Clock } from 'lucide-react';

interface MobileNavProps {
  currentTab: 'dashboard' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'history' | 'settings') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const { activeSession, currentElapsedMs } = useStudy();
  const isStudying = activeSession.status === 'running';
  const isPaused = activeSession.status === 'paused';

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header for Mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">StudyFlow</span>
        </div>

        {(isStudying || isPaused) && (
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              isStudying
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStudying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span>{formatHHMMSS(currentElapsedMs)}</span>
          </button>
        )}
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
