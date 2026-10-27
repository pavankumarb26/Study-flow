import React from 'react';
import { Modal } from '../common/Modal';
import { StudySession } from '../../types/study';
import { formatDurationHuman, formatDateShort, formatTimeOfDay } from '../../utils/formatters';
import { SubjectBadge } from '../common/Badge';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Study Session?" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs">
            This action cannot be undone. This session will be permanently removed and dashboard statistics will update.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Subject:</span>
            <SubjectBadge subject={session.subject} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Duration:</span>
            <span className="font-mono font-bold text-slate-200">
              {formatDurationHuman(session.durationMs)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Date:</span>
            <span className="text-slate-300">{formatDateShort(session.startTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Time:</span>
            <span className="font-mono text-slate-400">
              {formatTimeOfDay(session.startTime)} – {formatTimeOfDay(session.endTime)}
            </span>
          </div>
          {session.notes && (
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">Notes:</span>
              <p className="text-slate-300 italic">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(session.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-colors"
          >
            Delete Session
          </button>
        </div>
      </div>
    </Modal>
  );
};
