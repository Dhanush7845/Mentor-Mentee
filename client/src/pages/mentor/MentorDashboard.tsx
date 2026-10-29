import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Compass, FileCheck2, Calendar, Award, Clock,
  ArrowRight, Plus, CheckCircle2, AlertCircle, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aData, rData, sData, repData] = await Promise.all([
          api.getAssignedMentees(),
          api.getRecommendations(),
          api.getSessions(),
          api.getMentorReports()
        ]);
        setAssigned(aData);
        setRecs(rData);
        setSessions(sData);
        setReports(repData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcomingSession = sessions.find((s) => s.status === 'scheduled');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="dark-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" /> Mentor Faculty Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Managing <strong>{assigned.length} assigned mentee(s)</strong> in {user?.department}. Provide personalized learning recommendations, evaluate project deliverables, and track career readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/mentor/recommendations"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Recommendation
            </Link>
            <Link
              to="/mentor/sessions"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Manage Sessions
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Mentees"
          value={assigned.length}
          subtitle="Max Capacity: 3"
          icon={Users}
          variant="indigo"
        />
        <StatsCard
          title="Recommendations"
          value={recs.length}
          subtitle={`${recs.filter(r => r.status === 'completed').length} completed`}
          icon={Compass}
          variant="cyan"
        />
        <StatsCard
          title="Total Hours Mentored"
          value={`${reports?.totalHoursMentored || 36}h`}
          subtitle={`${reports?.completedSessions || 36} sessions held`}
          icon={Clock}
          variant="emerald"
        />
        <StatsCard
          title="Upcoming Consultations"
          value={sessions.filter(s => s.status === 'scheduled').length}
          subtitle="Next on Nov 2"
          icon={Calendar}
          variant="amber"
        />
      </div>

      {/* Assigned Mentees Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Assigned Mentees</h2>
            <p className="text-xs text-slate-400">Review profiles, add private notes, and assign custom development roadmaps</p>
          </div>
          <Link to="/mentor/assigned" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
            All Mentees <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assigned.map((a) => (
            <div
              key={a.assignmentId}
              className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <img
                    src={a.mentee.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                    alt={a.mentee.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{a.mentee.name}</h3>
                    <p className="text-xs text-slate-400">{a.mentee.currentDegree} • {a.mentee.academicYear}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="cyan" size="sm">{a.matchScore}% Match</Badge>
                      <span className="text-[11px] text-slate-500">Target: {a.mentee.targetRole}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Deliverables Progress</span>
                    <span className="font-bold text-white">{a.stats.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${a.stats.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{a.stats.completedTasks} of {a.stats.totalTasks} Tasks Completed</span>
                    {a.stats.overdueTasks > 0 && <span className="text-rose-400 font-bold">{a.stats.overdueTasks} Overdue</span>}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <Link
                  to={`/mentor/mentee/${a.mentee.id}`}
                  className="flex-1 py-2 rounded-xl text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  View Profile & Private Notes
                </Link>
                <Link
                  to="/mentor/messages"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Message Mentee"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
