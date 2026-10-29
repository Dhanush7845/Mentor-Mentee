import React, { useEffect, useState } from 'react';
import { 
  Calendar, Video, Star, Clock, CheckCircle2, 
  Search, Filter, ExternalLink, RefreshCw, Eye, MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const SessionMonitoring: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const { showToast } = useToast();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getSessions();
      setSessions(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const ratedSessions = sessions.filter(s => s.rating);
  const avgRating = ratedSessions.length > 0 
    ? (ratedSessions.reduce((acc, s) => acc + s.rating, 0) / ratedSessions.length).toFixed(1)
    : '4.9';

  const filtered = sessions.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = (s.title && s.title.toLowerCase().includes(term)) ||
                          (s.mentorName && s.mentorName.toLowerCase().includes(term)) ||
                          (s.menteeName && s.menteeName.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Video className="w-3.5 h-3.5" /> Platform Session Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Session Monitoring & Attendance
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Monitor 1-on-1 scheduled sessions across all pairs, verify attendance logs, and track mentee satisfaction feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSessions}
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
          title="Total Scheduled"
          value={totalSessions}
          icon={Calendar}
          trend="All cohort sessions"
          trendType="neutral"
        />
        <StatsCard
          title="Completed Sessions"
          value={completedSessions}
          icon={CheckCircle2}
          trend={`${Math.round((completedSessions / (totalSessions || 1)) * 100)}% execution rate`}
          trendType="positive"
        />
        <StatsCard
          title="Upcoming In Pipeline"
          value={scheduledSessions}
          icon={Clock}
          trend="Next 14 days"
          trendType="neutral"
        />
        <StatsCard
          title="Mentee Satisfaction"
          value={`${avgRating} / 5.0`}
          icon={Star}
          trend="Across reviewed sessions"
          trendType="positive"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {['all', 'scheduled', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions or participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Session Title</th>
                <th className="px-6 py-4 font-semibold">Mentor</th>
                <th className="px-6 py-4 font-semibold">Mentee</th>
                <th className="px-6 py-4 font-semibold">Scheduled Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No sessions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{s.title}</div>
                      {s.meetingLink && (
                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Video className="w-3 h-3" /> Join Room <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-white">
                      {s.mentorName || 'Mentor'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-white">
                      {s.menteeName || 'Mentee'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div>{s.date}</div>
                      <div className="text-[11px] text-slate-500">{s.time} ({s.durationMinutes || 60}m)</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        s.status === 'completed' ? 'success' :
                        s.status === 'scheduled' ? 'info' : 'danger'
                      }>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {s.rating ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.rating}.0
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">â€”</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSession(null)}
          title={`Session Details: ${selectedSession.title}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Mentor:</span>
                <p className="font-bold text-white text-sm">{selectedSession.mentorName}</p>
              </div>
              <div>
                <span className="text-slate-500">Mentee:</span>
                <p className="font-bold text-white text-sm">{selectedSession.menteeName}</p>
              </div>
              <div>
                <span className="text-slate-500">Scheduled Date:</span>
                <p className="text-slate-300">{selectedSession.date} at {selectedSession.time}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-bold text-emerald-400 capitalize">{selectedSession.status}</p>
              </div>
            </div>

            {selectedSession.agenda && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Agenda</h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedSession.agenda}
                </div>
              </div>
            )}

            {selectedSession.mentorNotes && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Mentor Session Notes</h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedSession.mentorNotes}
                </div>
              </div>
            )}

            {selectedSession.menteeFeedback && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Mentee Feedback & Review</h4>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                  <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> Rating: {selectedSession.rating || 5}/5
                  </div>
                  "{selectedSession.menteeFeedback}"
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
