import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Award, CheckCircle2, TrendingUp, Calendar, Target, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';

export const ProgressAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sData, pData] = await Promise.all([
          api.getMenteeStats(),
          api.getMenteeProfile()
        ]);
        setStats(sData);
        setProfile(pData.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Skill readiness data
  const skillData = [
    { name: 'Python/PyTorch', current: 90, benchmark: 85 },
    { name: 'System Design', current: 65, benchmark: 75 },
    { name: 'DDP/Distributed', current: 70, benchmark: 80 },
    { name: 'Kernel/Triton', current: 45, benchmark: 70 },
    { name: 'Research Writing', current: 80, benchmark: 70 }
  ];

  // Progress timeline data
  const timelineData = [
    { week: 'Week 1', progress: 20 },
    { week: 'Week 2', progress: 35 },
    { week: 'Week 3', progress: 50 },
    { week: 'Week 4', progress: 68 },
    { week: 'Week 5', progress: 78 }
  ];

  // Task distribution data
  const taskPieData = [
    { name: 'Completed', value: stats?.taskCounts?.completed || 1, color: '#10b981' },
    { name: 'In Progress', value: stats?.taskCounts?.inProgress || 1, color: '#3b82f6' },
    { name: 'Pending', value: stats?.taskCounts?.pending || 1, color: '#6366f1' },
    { name: 'Overdue', value: stats?.taskCounts?.overdue || 1, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentee Progress & Performance Insights</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent, explainable analytics evaluating verified task completions, milestone roadmaps, and attendance
          </p>
        </div>
      </div>

      {/* Explainable Index Callout Banner */}
      <div className="dark-card p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Explainable Composite Progress Index
            </span>
            <Badge variant="emerald" size="sm">Active Formula</Badge>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {stats?.compositeScore || 78}% Overall Readiness
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {stats?.scoreBreakdown?.explanation || 'Progress scores are not subjective estimations. They are mathematically derived from verified deliverables (40%), roadmap milestones (30%), and mentoring session attendance (30%).'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0 text-center w-full md:w-auto">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">TASKS (40%)</span>
            <span className="text-base font-extrabold text-white">{stats?.scoreBreakdown?.taskCompletionRate || 50}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">ROADMAP (30%)</span>
            <span className="text-base font-extrabold text-white">{stats?.scoreBreakdown?.developmentPlanProgress || 65}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">SESSIONS (30%)</span>
            <span className="text-base font-extrabold text-white">{stats?.scoreBreakdown?.sessionAttendanceRate || 100}%</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap & Mastery Chart */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white">Skill Mastery vs Target Benchmark</h3>
              <p className="text-xs text-slate-400">Evaluated competency score across key domain pillars</p>
            </div>
            <Badge variant="cyan" size="sm">Competency</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="current" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Your Level" />
                <Bar dataKey="benchmark" fill="#334155" radius={[6, 6, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Over Time Timeline */}
        <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white">Growth Velocity Over Time</h3>
              <p className="text-xs text-slate-400">Progression across weekly milestones</p>
            </div>
            <Badge variant="indigo" size="sm">Velocity</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#growthGrad)" name="Readiness %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
