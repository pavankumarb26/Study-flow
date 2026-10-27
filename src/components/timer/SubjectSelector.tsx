import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { getSubjectColor } from '../../utils/dateUtils';
import { ChevronDown, Plus, Check, Trash2, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';

export const SubjectSelector: React.FC = () => {
  const {
    selectedSubject,
    setSelectedSubject,
    activeSession,
    subjects,
    addSubject,
    deleteSubject,
    changeActiveSessionSubject,
  } = useStudy();

  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [isSwitchActiveModalOpen, setIsSwitchActiveModalOpen] = useState(false);
  const [pendingActiveSubject, setPendingActiveSubject] = useState('');

  const isTimerActive = activeSession.status !== 'idle';
  const currentColor = getSubjectColor(selectedSubject);

  const handleSelect = (subject: string) => {
    if (isTimerActive) {
      if (subject !== selectedSubject) {
        setPendingActiveSubject(subject);
        setIsSwitchActiveModalOpen(true);
      }
      setIsOpen(false);
      return;
    }
    setSelectedSubject(subject);
    setIsOpen(false);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (trimmed) {
      addSubject(trimmed);
      if (isTimerActive) {
        setPendingActiveSubject(trimmed);
        setIsSwitchActiveModalOpen(true);
      } else {
        setSelectedSubject(trimmed);
      }
      setCustomSubjectInput('');
      setIsAddingCustom(false);
      setIsOpen(false);
    }
  };

  const confirmSwitchActiveSubject = () => {
    if (pendingActiveSubject) {
      changeActiveSessionSubject(pendingActiveSubject);
    }
    setIsSwitchActiveModalOpen(false);
    setPendingActiveSubject('');
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          Focus Subject
        </span>
        {isTimerActive && (
          <span className="text-[10px] text-amber-400/90 font-medium">
            (Click to change active subject)
          </span>
        )}
      </div>

      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-slate-900/90 hover:bg-slate-800/80 border-slate-700/80 text-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: currentColor }}
          />
          <span className="truncate">{selectedSubject}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setIsOpen(false);
              setIsAddingCustom(false);
            }}
          />
          <div className="absolute top-full left-0 right-0 mt-2 py-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-xl z-40 overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {subjects.map((subject) => {
                const color = getSubjectColor(subject);
                const isSelected = selectedSubject === subject;

                return (
                  <div
                    key={subject}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors group ${
                      isSelected
                        ? 'bg-brand-500/10 text-brand-300 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(subject)}
                      className="flex-1 flex items-center gap-2.5 text-left truncate mr-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{subject}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-brand-400 mr-1" />}
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubject(subject);
                          }}
                          title={`Delete ${subject}`}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Subject Input */}
            <div className="p-2 border-t border-slate-800">
              {isAddingCustom ? (
                <form onSubmit={handleAddCustom} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Subject name (e.g. System Design)..."
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    autoFocus
                    className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Add
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-brand-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Subject</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Switch Active Session Subject Modal */}
      <Modal
        isOpen={isSwitchActiveModalOpen}
        onClose={() => setIsSwitchActiveModalOpen(false)}
        title="Change Active Subject?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            You currently have an active study session running for{' '}
            <strong className="text-white">{selectedSubject}</strong>.
            Do you want to reassign this ongoing session to{' '}
            <strong className="text-brand-300">{pendingActiveSubject}</strong>?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsSwitchActiveModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSwitchActiveSubject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Subject</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
