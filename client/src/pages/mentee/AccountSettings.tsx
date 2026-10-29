import React, { useState } from 'react';
import { Shield, Eye, Bell, Lock, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [visibility, setVisibility] = useState('mentor_only');
  const [docSharing, setDocSharing] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password updated successfully', 'success');
    setCurrentPass('');
    setNewPass('');
  };

  const handleSavePrivacy = () => {
    showToast('Privacy preferences updated', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & Privacy Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Control your profile visibility, document permissions, and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privacy & Visibility Preferences */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> Permitted Profile Visibility
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Profile Viewing Scope</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'mentor_only'}
                    onChange={() => setVisibility('mentor_only')}
                    className="accent-cyan-400"
                  />
                  <div>
                    <span className="font-bold text-white block">Assigned Mentor Only (Recommended)</span>
                    <span className="text-[11px] text-slate-400">Restricted solely to your verified mentor & administrators</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'public_program'}
                    onChange={() => setVisibility('public_program')}
                    className="accent-cyan-400"
                  />
                  <div>
                    <span className="font-bold text-white block">Program-Wide Directory</span>
                    <span className="text-[11px] text-slate-400">Discoverable by all cohort peers and mentors</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Document Sharing Permissions</span>
                  <span className="text-[11px] text-slate-400">Allow assigned mentor to view and annotate uploaded resume</span>
                </div>
                <input
                  type="checkbox"
                  checked={docSharing}
                  onChange={(e) => setDocSharing(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">In-App Recommendation Alerts</span>
                  <span className="text-[11px] text-slate-400">Instant notifications when new milestones are assigned</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={handleSavePrivacy}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
            >
              Save Privacy Preferences
            </button>
          </div>
        </div>

        {/* Security & Password */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Security & Password
          </h3>

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Passwords must be at least 8 characters and include a mixture of letters and numbers.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
