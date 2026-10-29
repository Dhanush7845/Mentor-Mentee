import React, { useEffect, useState } from 'react';
import { 
  Compass, CheckSquare, AlertTriangle, CheckCircle2, 
  Search, Filter, ExternalLink, RefreshCw, Clock, ArrowUpRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';

export const RecommendationTaskMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recs' | 'tasks'>('recs');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsRes, tasksRes] = await Promise.all([
        api.getRecommendations(),
        api.getTasks()
      ]);
      setRecommendations(recsRes);
      setTasks(tasksRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load monitoring data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRecs = recommendations.length;
  const completedRecs = recommendations.filter(r => r.status === 'completed').length;
  const inProgressRecs = recommendations.filter(r => r.status === 'in_progress' || r.status === 'accepted').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

  const filteredRecs = recommendations.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = (r.title && r.title.toLowerCase().includes(term)) ||
                          (r.menteeName && r.menteeName.toLowerCase().includes(term)) ||
                          (r.mentorName && r.mentorName.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = t.title && t.title.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" /> Mentorship Output Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recommendations & Task Oversight
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Monitor mentor recommendation flows, task completion timelines, overdue deliverables, and submitted evidence across mentees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Published Recommendations"
          value={totalRecs}
          icon={Compass}
          trend={`${inProgressRecs} currently active`}
          trendType="neutral"
        />
        <StatsCard
          title="Recommendation Completion"
          value={`${Math.round((completedRecs / (totalRecs || 1)) * 100)}%`}
          icon={CheckCircle2}
          trend={`${completedRecs} fulfilled`}
          trendType="positive"
        />
        <StatsCard
          title="Total Assigned Tasks"
          value={totalTasks}
          icon={CheckSquare}
          trend={`${completedTasks} finished`}
          trendType="neutral"
        />
        <StatsCard
          title="Overdue Tasks"
          value={overdueTasks}
          icon={AlertTriangle}
          trend={overdueTasks > 0 ? "Requires mentor check-in" : "Zero overdue"}
          trendType={overdueTasks > 0 ? "warning" : "positive"}
        />
      </div>

      {/* Dual Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('recs'); setStatusFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'recs'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" /> Recommendations ({totalRecs})
          </button>
          <button
            onClick={() => { setActiveTab('tasks'); setStatusFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Tasks Tracker ({totalTasks})
            {overdueTasks > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {overdueTasks}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-56"
          />
        </div>
      </div>

      {/* TAB 1: Recommendations */}
      {activeTab === 'recs' && (
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Mentee</th>
                  <th className="px-6 py-4 font-semibold">Mentor</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecs.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{r.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{r.description}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-white">{r.menteeName || 'Mentee'}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{r.mentorName || 'Mentor'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 capitalize">
                        {r.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'neutral'}>
                        {r.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'in_progress' ? 'info' : 'warning'}>
                        {r.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Task Title</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Evidence / Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTasks.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{t.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {t.dueDate || 'No due date'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.priority === 'urgent' || t.priority === 'high' ? 'danger' : 'neutral'}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.status === 'completed' ? 'success' : t.status === 'overdue' ? 'danger' : 'info'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {t.evidenceUrl ? (
                        <a
                          href={t.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          View Link <ArrowUpRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">Pending submission</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
