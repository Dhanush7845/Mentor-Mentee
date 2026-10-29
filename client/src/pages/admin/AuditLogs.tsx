import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, Search, Filter, RefreshCw, 
  Shield, User, UserCheck, Settings, AlertCircle, Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { showToast } = useToast();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs();
      setLogs(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const actionCategories: Record<string, string> = {
    ASSIGN_MENTEE: 'assignment',
    UNASSIGN_MENTEE: 'assignment',
    APPROVE_MENTOR: 'approval',
    REJECT_MENTOR: 'approval',
    ACTIVATE_USER: 'account',
    DEACTIVATE_USER: 'account',
    LOGIN: 'auth',
    LOGOUT: 'auth',
  };

  const actionVariant = (action: string): any => {
    const cat = actionCategories[action] || 'other';
    if (cat === 'assignment') return 'info';
    if (cat === 'approval') return 'success';
    if (cat === 'account') return 'warning';
    if (cat === 'auth') return 'neutral';
    return 'neutral';
  };

  const filtered = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (log.actorName && log.actorName.toLowerCase().includes(term)) ||
                          (log.action && log.action.toLowerCase().includes(term)) ||
                          (log.target && log.target.toLowerCase().includes(term));
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/80 border border-slate-600/50 text-slate-300 text-xs font-semibold mb-3">
            <ClipboardList className="w-3.5 h-3.5" /> Immutable Activity Record
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative Audit Logs
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Comprehensive timestamped records of all significant platform events ? admin actions, role changes, approvals, and assignment activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, action, or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Action Types</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Actor</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Target</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No audit log entries found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log: any, idx: number) => (
                  <tr key={log.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs text-white font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        {log.actorName || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={actionVariant(log.action)}>
                        {log.action?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300 max-w-40 truncate">
                      {log.target || '?'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-48 truncate">
                      {log.details || '?'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {log.ip || '?'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
