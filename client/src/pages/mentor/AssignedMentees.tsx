import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, MessageSquare, ArrowRight, Award, Compass, FileCheck2 } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';

export const AssignedMentees: React.FC = () => {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAssignedMentees();
        setAssigned(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = assigned.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.mentee.name.toLowerCase().includes(s) ||
      a.mentee.department.toLowerCase().includes(s) ||
      a.mentee.targetRole.toLowerCase().includes(s) ||
      a.mentee.skills.some((sk: string) => sk.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Assigned Mentees</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mentees assigned to you by administration based on domain expertise and availability
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skills, role..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((a) => (
          <div
            key={a.assignmentId}
            className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={a.mentee.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                    alt={a.mentee.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{a.mentee.name}</h3>
                    <p className="text-xs text-slate-400">{a.mentee.currentDegree} • {a.mentee.academicYear}</p>
                    <p className="text-[11px] text-cyan-400 font-medium mt-0.5">Target: {a.mentee.targetRole}</p>
                  </div>
                </div>
                <Badge variant="cyan" size="sm">{a.matchScore}% Match</Badge>
              </div>

              {/* Skills Tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Verified Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {a.mentee.skills?.slice(0, 5).map((sk: string) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Roadmap Deliverables</span>
                  <span className="font-bold text-emerald-400">{a.stats.progressPercent}% Completed</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${a.stats.progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{a.stats.completedTasks} of {a.stats.totalTasks} Tasks</span>
                  <span>{a.stats.totalRecs} Recommendations</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <Link
                to={`/mentor/mentee/${a.mentee.id}`}
                className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Open Mentee Profile & Notes
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
  );
};
