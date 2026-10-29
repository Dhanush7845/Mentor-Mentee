import React, { useEffect, useState } from 'react';
import {
  Calendar, Clock, Video, Plus, CheckCircle2, Star, ExternalLink,
  MessageSquare, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Session } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const SessionsCalendar: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentorData, setMentorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingOpen, setBookingOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00 - 18:00 EST');
  const [agenda, setAgenda] = useState('');

  // Feedback Modal
  const [feedbackSession, setFeedbackSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [sess, mData] = await Promise.all([
        api.getSessions(),
        api.getAssignedMentor()
      ]);
      setSessions(sess);
      setMentorData(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorData?.mentor) return;
    try {
      await api.createSession({
        mentorId: mentorData.mentor.id,
        title,
        date,
        time,
        agenda,
        meetingLink: 'https://meet.google.com/mentorconnect-room'
      });
      showToast('Mentoring session requested and scheduled!', 'success');
      setBookingOpen(false);
      setTitle('');
      setDate('');
      setAgenda('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to book session', 'error');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSession) return;
    try {
      await api.submitSessionFeedback(feedbackSession.id, { rating, feedback });
      showToast('Feedback submitted successfully. Thank you!', 'success');
      setFeedbackSession(null);
      setFeedback('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    }
  };

  const upcoming = sessions.filter((s) => s.status === 'scheduled');
  const past = sessions.filter((s) => s.status === 'completed' || s.status === 'cancelled');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentoring Sessions & Schedule</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Book 1-on-1 consultations, review past discussion agendas, and provide session ratings
          </p>
        </div>

        <button
          onClick={() => setBookingOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Schedule New Session
        </button>
      </div>

      {/* Upcoming Sessions Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Upcoming Mentoring Meetings
        </h2>

        {upcoming.length === 0 ? (
          <div className="dark-card p-8 border border-dashed border-slate-800 bg-slate-900/40 text-center rounded-2xl">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No upcoming sessions</p>
            <p className="text-xs text-slate-400 mt-1">Click "Schedule New Session" to propose a time slot with your mentor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div
                key={s.id}
                className="dark-card p-5 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{s.title}</span>
                    <Badge variant="cyan" size="sm">Scheduled</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {s.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.time} ({s.durationMinutes}m)
                    </span>
                    <span className="text-slate-400">Mentor: {s.mentorName}</span>
                  </div>
                  <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-2">
                    <strong>Agenda:</strong> {s.agenda}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={s.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20 flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" /> Join Video Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions Archive */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Session History & Action Items
        </h2>

        <div className="space-y-3">
          {past.map((s) => (
            <div
              key={s.id}
              className="dark-card p-5 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{s.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">Held on {s.date} • {s.time}</div>
                </div>
                <Badge variant={s.status === 'completed' ? 'emerald' : 'rose'} size="sm">
                  {s.status}
                </Badge>
              </div>

              {s.mentorNotes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mentor Summary:</span>
                  <p>{s.mentorNotes}</p>
                </div>
              )}

              {s.menteeFeedback ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <span className="text-amber-400">{'★'.repeat(s.rating || 5)}</span>
                  <span>Feedback: "{s.menteeFeedback}"</span>
                </div>
              ) : (
                <button
                  onClick={() => { setFeedbackSession(s); setRating(5); setFeedback(''); }}
                  className="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5" /> Rate Session & Submit Feedback
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Book Session Modal */}
      <Modal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Schedule Mentoring Consultation"
        subtitle={`With ${mentorData?.mentor?.name || 'Assigned Mentor'}`}
      >
        <form onSubmit={handleBookSession} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Session Title / Topic</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-term Progress Sync & Technical Architecture Review"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proposed Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred Time Window</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="16:00 - 17:00 EST"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Agenda & Questions for Discussion</label>
            <textarea
              required
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="1. Review Vector DB benchmark results
2. Discuss upcoming open source PR..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
            >
              Book Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Post Session Feedback Modal */}
      <Modal
        isOpen={!!feedbackSession}
        onClose={() => setFeedbackSession(null)}
        title="Post-Session Feedback"
        subtitle={`Session: "${feedbackSession?.title}"`}
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-xl ${rating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
              <span className="text-slate-400 ml-2 font-bold">{rating} of 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Qualitative Feedback</label>
            <textarea
              required
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What was most helpful about this meeting? Any action items discussed?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFeedbackSession(null)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
