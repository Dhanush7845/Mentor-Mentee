import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  FileCheck2,
  Compass,
  ArrowRight,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';

export const MenteeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sData, mData, tData, rData, sessData, aData] = await Promise.all([
          api.getMenteeStats(),
          api.getAssignedMentor(),
          api.getTasks(),
          api.getRecommendations(),
          api.getSessions(),
          api.getAnnouncements()
        ]);
        setStats(sData);
        setMentorData(mData);
        setTasks(tData);
        setRecs(rData);
        setSessions(sessData);
        setAnnouncements(aData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcomingSession = sessions.find((s) => s.status === 'scheduled');
  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="dark-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Mentee Portal Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              You are paired with <strong className="text-white">{mentorData?.mentor?.name || 'Assigned Mentor'}</strong> in {user?.department}. Track recommendations, roadmap milestones, and task deliverables below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/mentee/recommendations"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> View Recommendations
            </Link>
            <Link
              to="/mentee/sessions"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book Session
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Progress Score"
          value={`${stats?.compositeScore || 78}%`}
          subtitle="Based on tasks & attendance"
          icon={Award}
          variant="indigo"
          trend={{ value: 'Explainable index', positive: true }}
        />
        <StatsCard
          title="Active Tasks"
          value={stats?.taskCounts?.inProgress + stats?.taskCounts?.pending || 2}
          subtitle={`${stats?.taskCounts?.completed || 1} completed`}
          icon={FileCheck2}
          variant="cyan"
        />
        <StatsCard
          title="Recommendations"
          value={stats?.recommendationCounts?.total || 4}
          subtitle={`${stats?.recommendationCounts?.accepted || 1} accepted, ${stats?.recommendationCounts?.completed || 1} finished`}
          icon={Compass}
          variant="emerald"
        />
        <StatsCard
          title="Upcoming Sessions"
          value={stats?.sessionsCount?.upcoming || 1}
          subtitle={`${stats?.sessionsCount?.completed || 2} completed sessions`}
          icon={Calendar}
          variant="amber"
        />
      </div>

      {/* Announcements Broadcast Widget */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Announcement</span>
              <Badge variant="indigo" size="sm">{announcements[0].priority}</Badge>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{announcements[0].title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{announcements[0].content}</p>
          </div>
        </div>
      )}

      {/* Two Column Grid: Assigned Mentor & Upcoming Session + Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Mentor Snapshot */}
        <div className="space-y-6 lg:col-span-1">
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Assigned Mentor</span>
              <Badge variant="emerald" size="sm">Active Pair</Badge>
            </div>

            {mentorData?.assigned ? (
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={mentorData.mentor.avatar}
                    alt={mentorData.mentor.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{mentorData.mentor.name}</h3>
                    <p className="text-xs text-slate-400">{mentorData.mentor.profile?.title || 'Mentor Specialist'}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-semibold">
                      ★ {mentorData.mentor.profile?.rating || '4.9'} <span className="text-slate-500">rating</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Expertise:</div>
                  <div className="flex flex-wrap gap-1">
                    {mentorData.mentor.profile?.expertise?.slice(0, 4).map((exp: string) => (
                      <span key={exp} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    to="/mentee/mentor"
                    className="flex-1 py-2 rounded-xl text-center text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    View Full Profile
                  </Link>
                  <Link
                    to="/mentee/messages"
                    className="flex-1 py-2 rounded-xl text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-6 text-center">
                <p className="text-xs text-slate-400">You are currently in the matching queue.</p>
              </div>
            )}
          </div>

          {/* Next Scheduled Meeting */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Session</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>

            {upcomingSession ? (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{upcomingSession.title}</span>
                  <Badge variant="cyan" size="sm">Scheduled</Badge>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {upcomingSession.date} at {upcomingSession.time}
                </div>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {upcomingSession.agenda}
                </p>
                <a
                  href={upcomingSession.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20"
                >
                  Join Google Meet <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="pt-6 text-center text-xs text-slate-400">
                No upcoming sessions scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Tasks & Recent Recommendations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Tasks Widget */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">Active Tasks & Deliverables</h3>
                <p className="text-xs text-slate-400">Assigned by your mentor for current milestones</p>
              </div>
              <Link to="/mentee/tasks" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {activeTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No pending tasks!</p>
              ) : (
                activeTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{t.title}</span>
                        <Badge
                          variant={
                            t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'amber' : 'indigo'
                          }
                          size="sm"
                        >
                          {t.priority}
                        </Badge>
                        {t.status === 'overdue' && <Badge variant="rose" size="sm">Overdue</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                      <div className="text-[11px] text-slate-500">Due: {t.dueDate}</div>
                    </div>
                    <Link
                      to="/mentee/tasks"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                    >
                      Submit Work
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mentor Recommendations Snapshot */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">Latest Recommendations</h3>
                <p className="text-xs text-slate-400">Targeted courses, papers, and career milestones</p>
              </div>
              <Link to="/mentee/recommendations" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs.slice(0, 2).map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="cyan" size="sm">{r.category}</Badge>
                      <Badge variant={r.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-xs text-white leading-snug">{r.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Est: {r.estimatedHours} hrs</span>
                    <Link to="/mentee/recommendations" className="text-cyan-400 font-semibold hover:underline">
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
