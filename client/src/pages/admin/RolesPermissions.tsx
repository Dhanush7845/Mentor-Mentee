import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Eye, EyeOff, Database, 
  Users, UserCheck, Settings, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

const ROLE_MATRIX = [
  { feature: 'View Own Profile', mentee: true, mentor: false, admin: true },
  { feature: 'Edit Own Profile', mentee: true, mentor: false, admin: true },
  { feature: 'View Assigned Mentees', mentee: false, mentor: true, admin: true },
  { feature: 'View Unassigned Mentees', mentee: false, mentor: false, admin: true },
  { feature: 'Create Recommendations', mentee: false, mentor: true, admin: true },
  { feature: 'Create/Assign Tasks', mentee: false, mentor: true, admin: true },
  { feature: 'Accept/Decline Recommendations', mentee: true, mentor: false, admin: false },
  { feature: 'Schedule Sessions', mentee: true, mentor: true, admin: true },
  { feature: 'Submit Session Feedback', mentee: true, mentor: false, admin: false },
  { feature: 'Add Private Mentor Notes', mentee: false, mentor: true, admin: true },
  { feature: 'Read Private Mentor Notes', mentee: false, mentor: true, admin: true },
  { feature: 'Manage User Accounts', mentee: false, mentor: false, admin: true },
  { feature: 'Approve Mentor Registrations', mentee: false, mentor: false, admin: true },
  { feature: 'Assign Mentors to Mentees', mentee: false, mentor: false, admin: true },
  { feature: 'View Audit Logs', mentee: false, mentor: false, admin: true },
  { feature: 'Publish Announcements', mentee: false, mentor: false, admin: true },
  { feature: 'Export CSV Reports', mentee: false, mentor: false, admin: true },
  { feature: 'Reset Platform Data', mentee: false, mentor: false, admin: true },
  { feature: 'Manage Departments & Skills', mentee: false, mentor: false, admin: true },
  { feature: 'Configure Program Settings', mentee: false, mentor: false, admin: true },
];

export const RolesPermissions: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { showToast } = useToast();

  const handleSavePrivacy = () => {
    showToast('Privacy policy settings saved (read-only view in this demo)', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Principle of Least Privilege
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Roles, Permissions & Privacy Policies
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Platform-enforced access control matrix defining what each role can see and do. Role boundaries are enforced at the API layer with JWT verification.
          </p>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Access Control Matrix
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Permitted</span>
            <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Denied</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left font-semibold w-1/2">Feature / Permission</th>
                <th className="px-6 py-3 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400">Mentee</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-400">Mentor</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Admin</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ROLE_MATRIX.map((row, idx) => (
                <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-950/20'}`}>
                  <td className="px-6 py-3 text-sm text-slate-300 font-medium">{row.feature}</td>
                  <td className="px-6 py-3 text-center">
                    {row.mentee
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      : <AlertCircle className="w-5 h-5 text-rose-500/60 mx-auto" />
                    }
                  </td>
                  <td className="px-6 py-3 text-center">
                    {row.mentor
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      : <AlertCircle className="w-5 h-5 text-rose-500/60 mx-auto" />
                    }
                  </td>
                  <td className="px-6 py-3 text-center">
                    {row.admin
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      : <AlertCircle className="w-5 h-5 text-rose-500/60 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-400" />
            Data Retention & Privacy Policies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Mentor Private Notes',
              desc: 'Private mentor notes are only visible to the author mentor and admins. Mentees cannot access these records.',
              status: 'enforced'
            },
            {
              title: 'Document Access Control',
              desc: 'Resume and document uploads are scoped per mentee. Only the assigned mentor and admins can access uploaded files.',
              status: 'enforced'
            },
            {
              title: 'Cross-Mentee Data Isolation',
              desc: 'Mentors are isolated to their assigned mentees only. API queries enforce userId-level filtering via JWT claims.',
              status: 'enforced'
            },
            {
              title: 'Audit Log Retention',
              desc: 'All admin actions are logged with timestamp, actor identity, and IP address. Logs are retained permanently.',
              status: 'enforced'
            },
            {
              title: 'Account Deletion Rights',
              desc: 'Mentees may request full data deletion via the account settings page. Admins process these within 14 days.',
              status: 'process'
            },
            {
              title: 'Notification Privacy',
              desc: 'Notification content is user-scoped. Users only receive alerts relevant to their role and relationships.',
              status: 'enforced'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <Badge variant={item.status === 'enforced' ? 'success' : 'info'}>
                  {item.status === 'enforced' ? 'API Enforced' : 'Process'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
          <strong>Implementation Note:</strong> Role-based restrictions are enforced at the Express.js API layer via JWT token claims and the <code className="font-mono bg-indigo-500/20 px-1 rounded">requireRole</code> / <code className="font-mono bg-indigo-500/20 px-1 rounded">requireAssignedMentee</code> middleware functions. UI-level restrictions serve as a secondary UX layer only.
        </div>
      </div>
    </div>
  );
};
