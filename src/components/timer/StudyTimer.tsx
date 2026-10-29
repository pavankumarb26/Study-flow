import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatHHMMSS } from '../../utils/formatters';
import { SubjectSelector } from './SubjectSelector';
import { Play, Pause, Square, RotateCcw, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';

export const StudyTimer: React.FC = () => {
  const {
    activeSession,
    currentElapsedMs,
    sessionNotes,
    setSessionNotes,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
    discardTimer,
  } = useStudy();

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [modalNotes, setModalNotes] = useState('');
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const formattedTime = formatHHMMSS(currentElapsedMs);
  const isRunning = activeSession.status === 'running';
  const isPaused = activeSession.status === 'paused';
  const isIdle = activeSession.status === 'idle';

  const handleStart = () => {
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const openFinishModal = () => {
    // If under 5 seconds, prompt or let finishTimer handle minimum threshold
    if (currentElapsedMs < 5000) {
      if (confirm('Session is less than 5 seconds and will not be recorded. End now?')) {
        finishTimer();
      }
      return;
    }
    setModalNotes(sessionNotes);
    setIsFinishModalOpen(true);
  };

  const handleConfirmFinish = (e: React.FormEvent) => {
    e.preventDefault();
    finishTimer(modalNotes);
    setIsFinishModalOpen(false);
  };

  const handleConfirmDiscard = () => {
    discardTimer();
    setIsDiscardConfirmOpen(false);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Decorative ambient background glows */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRunning
            ? 'bg-brand-500/15'
            : isPaused
            ? 'bg-amber-500/10'
            : 'bg-brand-600/5'
        }`}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Status Pill Indicator */}
        <div className="mb-4">
          {isRunning && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>STUDYING ACTIVE</span>
            </div>
          )}
          {isPaused && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>SESSION PAUSED (BREAK)</span>
            </div>
          )}
          {isIdle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-slate-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>READY TO FOCUS</span>
            </div>
          )}
        </div>

        {/* Subject Dropdown Selector */}
        <div className="w-full max-w-xs mb-6">
          <SubjectSelector />
        </div>

        {/* Large Central Timer Display (HH:MM:SS) */}
        <div className="my-2 select-none">
          <div
            className={`font-mono font-bold tracking-tight text-6xl sm:text-7xl md:text-8xl tabular-nums transition-colors duration-300 ${
              isRunning
                ? 'text-white drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]'
                : isPaused
                ? 'text-amber-200/90'
                : 'text-slate-300'
            }`}
          >
            {formattedTime}
          </div>
        </div>

        {/* Optional Active Session Note Input */}
        {!isIdle && (
          <div className="w-full max-w-sm mt-3 mb-6">
            <input
              type="text"
              placeholder="What are you currently focusing on? (optional)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/70 text-center transition-colors"
            />
          </div>
        )}

        {/* Primary Controls: Start, Pause, Resume, Finish Session */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4">
          {isIdle && (
            <button
              type="button"
              onClick={handleStart}
              className="group flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-lg shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
              <span>Start Studying</span>
            </button>
          )}

          {isRunning && (
            <>
              {/* Pause Button */}
              <button
                type="button"
                onClick={handlePause}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>

              {/* Finish Session Button */}
              <button
                type="button"
                onClick={openFinishModal}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Session</span>
              </button>
            </>
          )}

          {isPaused && (
            <>
              {/* Resume Button */}
              <button
                type="button"
                onClick={handleResume}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>

              {/* Finish Session Button */}
              <button
                type="button"
                onClick={openFinishModal}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Session</span>
              </button>

              {/* Discard Timer Button */}
              <button
                type="button"
                onClick={() => setIsDiscardConfirmOpen(true)}
                title="Discard session without saving"
                className="p-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Informative Microcopy */}
        <p className="mt-4 text-xs text-slate-500 text-center">
          {isRunning && "Active study time is being tracked. Paused breaks won't count."}
          {isPaused && "Timer is paused. Take your break — or finish session to save to history."}
          {isIdle && "Timer starts from 00:00:00 every new day. Sessions auto-save at midnight."}
        </p>
      </div>

      {/* Finish Session Confirmation & Notes Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Complete Study Session"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmFinish} className="space-y-4">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Recorded Active Time</p>
              <p className="text-2xl font-mono font-bold text-brand-300 mt-0.5">{formattedTime}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Subject</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{activeSession.subject}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Session Notes or Accomplishments (optional)
            </label>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="e.g. Solved 3 LeetCode dynamic programming questions, wrote summary notes..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFinishModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
            >
              Save to History
            </button>
          </div>
        </form>
      </Modal>

      {/* Discard Confirmation Modal */}
      <Modal
        isOpen={isDiscardConfirmOpen}
        onClose={() => setIsDiscardConfirmOpen(false)}
        title="Discard Session?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to discard this session? The accumulated time of{' '}
            <span className="font-mono font-semibold text-amber-300">{formattedTime}</span> will not be saved.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDiscardConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Keep Session
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscard}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
