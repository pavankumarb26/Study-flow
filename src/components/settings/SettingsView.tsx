import React, { useState, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Modal } from '../common/Modal';
import {
  Target,
  Moon,
  Sun,
  Laptop,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { getSubjectColor } from '../../utils/dateUtils';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearAllData,
    exportData,
    importData,
    sessions,
    subjects,
    addSubject,
    deleteSubject,
    resetSubjects,
  } = useStudy();

  const [goalHours, setGoalHours] = useState((settings.dailyGoalMinutes / 60).toString());
  const [isSavedGoal, setIsSavedGoal] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<{ message: string; isError: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (trimmed) {
      addSubject(trimmed);
      setNewSubjectInput('');
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(goalHours);
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      updateSettings({ dailyGoalMinutes: Math.round(hours * 60) });
      setIsSavedGoal(true);
      setTimeout(() => setIsSavedGoal(false), 2500);
    }
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importData(content);
        if (result.success) {
          setImportNotification({
            message: `Successfully imported ${result.count ?? 0} sessions!`,
            isError: false,
          });
        } else {
          setImportNotification({
            message: result.error || 'Failed to parse import file',
            isError: true,
          });
        }
        setTimeout(() => setImportNotification(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your study preferences, audio feedback, and data management.
        </p>
      </div>

      {importNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-in fade-in duration-200 ${
            importNotification.isError
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}
        >
          {importNotification.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{importNotification.message}</span>
        </div>
      )}

      {/* Daily Study Goal */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Daily Study Target</h3>
            <p className="text-xs text-slate-400">Set the hours you aim to focus each calendar day.</p>
          </div>
        </div>

        <form onSubmit={handleGoalSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              hours/day
            </span>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-colors self-start sm:self-auto"
          >
            {isSavedGoal ? 'Saved!' : 'Update Goal'}
          </button>
        </form>
      </div>

      {/* Manage Subjects */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Study Subjects</h3>
              <p className="text-xs text-slate-400">
                Customize the list of subjects available in the timer and filters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetSubjects}
            title="Reset to default subjects"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Existing Subjects List */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map((sub) => {
            const color = getSubjectColor(sub);
            return (
              <div
                key={sub}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium bg-slate-950/70 border-slate-800 group transition-all"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-200">{sub}</span>
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteSubject(sub)}
                    title={`Delete ${sub}`}
                    className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Subject Form */}
        <form onSubmit={handleAddSubject} className="flex gap-2 max-w-sm">
          <input
            type="text"
            placeholder="Add subject (e.g. Distributed Systems)..."
            value={newSubjectInput}
            onChange={(e) => setNewSubjectInput(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Theme Selection */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Appearance & Theme</h3>
            <p className="text-xs text-slate-400">StudyFlow is optimized for deep focus in Dark Mode.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              settings.theme === 'dark'
                ? 'bg-brand-600/15 border-brand-500 text-brand-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Moon className="w-4 h-4 mb-1.5" />
            <span>Dark Theme</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              settings.theme === 'light'
                ? 'bg-brand-600/15 border-brand-500 text-brand-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Sun className="w-4 h-4 mb-1.5" />
            <span>Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'system' })}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
              settings.theme === 'system'
                ? 'bg-brand-600/15 border-brand-500 text-brand-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4 mb-1.5" />
            <span>System Default</span>
          </button>
        </div>
      </div>

      {/* Audio Cues */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Sound Effects</h3>
              <p className="text-xs text-slate-400">Play subtle audio chime cues on timer start, pause, and finish.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.soundEnabled ? 'bg-brand-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Data Management</h3>
            <p className="text-xs text-slate-400">
              Your study records are saved locally in your browser. Export a JSON backup to keep your records safe.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-brand-400" />
            <span>Import Backup</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-300">Clear All Stored Data</h3>
            <p className="text-xs text-rose-200/70 mt-0.5">
              Permanently delete all {sessions.length} study session records, timer state, and reset preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Reset StudyFlow Data?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              This will permanently delete all your saved study sessions ({sessions.length}) and reset your settings.
              This cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearAllData();
                setIsClearModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-colors"
            >
              Yes, Delete Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
