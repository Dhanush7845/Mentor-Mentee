import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Award, GitPullRequest, Clock, ShieldCheck, AlertCircle,
  FileCheck2, Compass, BarChart3, TrendingUp, RefreshCw, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = async () => {
    if (!window.confirm('Reset all platform records to initial seed defaults?')) return;
    try {
      await api.resetPlatformData();
      showToast('Platform reset to seed data defaults', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  const kpis = data?.kpis;
  const deptData = data?.departmentDistribution || [];
  const progressData = data?.progressDistribution || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Central Administration Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Program Overview & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Real-time platform activity metrics, mentor workload monitoring, transparent matching queues, and participation analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/matching"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <GitPullRequest className="w-4 h-4" /> Matching Engine ({kpis?.unassignedMenteesCount || 2})
          </Link>
          <a
            href="/api/admin/reports/export-csv"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button
            onClick={handleResetData}
            title="Reset platform demo records"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Mentees" value={kpis?.totalMentees || 4} icon={Users} variant="indigo" />
        <StatsCard title="Total Mentors" value={kpis?.totalMentors || 4} icon={Award} variant="cyan" />
        <StatsCard title="Active Pairs" value={kpis?.activeRelationships || 2} icon={GitPullRequest} variant="emerald" />
        <StatsCard title="Unassigned Queue" value={kpis?.unassignedMenteesCount || 2} icon={Clock} variant="amber" />
        <StatsCard title="Pending Approvals" value={kpis?.pendingMentorApprovalsCount || 1} icon={ShieldCheck} variant="rose" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Participation Bar Chart */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Department-Wise Mentee Distribution
            </span>
            <Badge variant="cyan" size="sm">Distribution</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Mentees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mentee Progress Distribution Pie */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mentee Roadmap Health Breakdown
            </span>
            <Badge variant="emerald" size="sm">Health</Badge>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={progressData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {progressData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
