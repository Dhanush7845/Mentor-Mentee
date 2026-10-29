import React, { useEffect, useState } from 'react';
import { 
  Settings, Calendar, ShieldAlert, CheckCircle2, RotateCcw, 
  Layers, Users, Sliders, Save, AlertCircle, Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const ProgramManagement: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    cohortName: 'Fall 2026 Leadership & Engineering Cohort',
    status: 'active',
    registrationOpen: true,
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    defaultMaxMentees: 3,
    minMeetingCadence: 'bi-weekly',
    requireGoalApproval: true,
    allowDirectChat: true,
    autoMatchingEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSettings();
      if (res && res.cohortName) {
        setSettings(res);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateAdminSettings(settings);
      showToast('Program configuration saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    const confirmation = window.confirm(
      'DANGER: Reset all platform data back to initial seed defaults?\n\nThis will reinitialize all mentees, mentors, tasks, recommendations, and assignments.'
    );
    if (!confirmation) return;
    try {
      await api.resetPlatformData();
      showToast('System data reset to seed defaults successfully', 'success');
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Settings className="w-3.5 h-3.5" /> Program Governance & Policies
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Program & Cohort Configuration
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Manage cohort schedules, participant capacity policies, registration controls, and administrative system utilities.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cohort Identity & Schedule */}
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Cohort Information & Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Active Cohort Title *
              </label>
              <input
                type="text"
                value={settings.cohortName || ''}
                onChange={(e) => setSettings({ ...settings, cohortName: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Cohort Start Date
              </label>
              <input
                type="date"
                value={settings.startDate || ''}
                onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Cohort Graduation Date
              </label>
              <input
                type="date"
                value={settings.endDate || ''}
                onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Program Policies & Rules */}
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Operational Policies & Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Default Maximum Mentees Per Mentor
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.defaultMaxMentees || 3}
                onChange={(e) => setSettings({ ...settings, defaultMaxMentees: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Recommended baseline is 3 mentees per senior mentor.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Expected Meeting Cadence
              </label>
              <select
                value={settings.minMeetingCadence || 'bi-weekly'}
                onChange={(e) => setSettings({ ...settings, minMeetingCadence: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="weekly">Weekly Sessions</option>
                <option value="bi-weekly">Bi-Weekly (Every 2 Weeks)</option>
                <option value="monthly">Monthly Sessions</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Used to highlight inactive pairs in monitoring views.</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Public Mentee Registration</p>
                <p className="text-xs text-slate-400">Allow new mentees to self-register via registration form</p>
              </div>
              <input
                type="checkbox"
                checked={settings.registrationOpen ?? true}
                onChange={(e) => setSettings({ ...settings, registrationOpen: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Algorithmic Matching Engine</p>
                <p className="text-xs text-slate-400">Generate explainable match score suggestions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoMatchingEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, autoMatchingEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="dark-card bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
            <ShieldAlert className="w-5 h-5" />
            Administrative Danger Zone
          </div>
          <p className="text-xs text-rose-300 leading-relaxed max-w-2xl">
            Resetting the platform will restore all users, mentor approvals, transparent matches, recommendations, and session calendars back to rich seed defaults. Use this to reset demo states cleanly.
          </p>
          <div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <RotateCcw className="w-4 h-4" /> Reset Platform to Seed Defaults
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
