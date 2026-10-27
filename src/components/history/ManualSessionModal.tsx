import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { formatLocalDateKey } from '../../utils/dateUtils';
import { useStudy } from '../../context/StudyContext';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({ isOpen, onClose }) => {
  const { addManualSession, subjects } = useStudy();

  const [date, setDate] = useState(formatLocalDateKey());
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [subject, setSubject] = useState(subjects[0] || 'DSA');
  const [customSubject, setCustomSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetSubject = subject === 'Custom' ? customSubject.trim() : subject;
    if (!targetSubject) {
      setErrorMsg('Please specify a subject');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    let startMs = startDateTime.getTime();
    let endMs = endDateTime.getTime();

    // If end time is earlier than start time, assume it ended the next morning
    if (endMs <= startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }

    const durationMs = endMs - startMs;
    if (durationMs < 60000) {
      setErrorMsg('Session duration must be at least 1 minute');
      return;
    }

    // Add manual session with precise interval
    addManualSession({
      subject: targetSubject,
      startTime: startMs,
      endTime: endMs,
      durationMs,
      intervals: [{ start: startMs, end: endMs }],
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Past Study Session" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {subjects.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors truncate ${
                  subject === s
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSubject('Custom')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                subject === 'Custom'
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              + Custom
            </button>
          </div>

          {subject === 'Custom' && (
            <input
              type="text"
              placeholder="Enter custom subject name..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 mt-1"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Notes / Topics Covered (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes on what was studied..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
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
            type="submit"
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-colors"
          >
            Log Session
          </button>
        </div>
      </form>
    </Modal>
  );
};
