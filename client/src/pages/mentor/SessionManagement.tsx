import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Plus, CheckCircle2, Star, Edit3 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Session } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState<Session | null>(null);

  // Form states
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('17:00 - 18:00 EST');
  const [agenda, setAgenda] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [sData, aData] = await Promise.all([
        api.getSessions(),
        api.getAssignedMentees()
      ]);
      setSessions(sData);
      setAssigned(aData);
      if (aData.length > 0 && !menteeId) setMenteeId(aData[0].mentee.id);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeId || !title || !date) return;
    try {
      await api.createSession({ menteeId, title, date, time, agenda, meetingLink: 'https://meet.google.com/mentorconnect-room' });
      showToast('Mentoring session scheduled', 'success');
      setCreateModalOpen(false);
      setTitle('');
      setDate('');
      setAgenda('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Scheduling failed', 'error');
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesModalOpen) return;
    try {
      await api.updateSessionNotes(notesModalOpen.id, { mentorNotes, status: 'completed' });
      showToast('Session summary & notes saved', 'success');
      setNotesModalOpen(null);
      setMentorNotes('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save notes', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentoring Sessions & Calendars</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage consultations, agendas, and record session summaries</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="dark-card p-5 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{s.title}</span>
                <Badge variant={s.status === 'completed' ? 'emerald' : 'cyan'} size="sm">
                  {s.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-400" /> {s.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {s.time}</span>
                <span className="text-slate-400">Mentee: {s.menteeName}</span>
              </div>
              <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-2">
                <strong>Agenda:</strong> {s.agenda}
              </p>
              {s.mentorNotes && (
                <p className="text-xs text-slate-200 bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/20 mt-1">
                  <strong>Notes:</strong> {s.mentorNotes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setNotesModalOpen(s); setMentorNotes(s.mentorNotes || ''); }}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Session Notes
              </button>
              <a
                href={s.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1"
              >
                <Video className="w-3.5 h-3.5" /> Call Link
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Schedule Mentoring Consultation">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Mentee</label>
            <select
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {assigned.map((a) => (
                <option key={a.mentee.id} value={a.mentee.id}>{a.mentee.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Topic / Agenda</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-term Progress Review"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Time</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Agenda</label>
            <textarea rows={3} required value={agenda} onChange={(e) => setAgenda(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">Schedule Session</button>
          </div>
        </form>
      </Modal>

      {/* Session Notes Modal */}
      <Modal isOpen={!!notesModalOpen} onClose={() => setNotesModalOpen(null)} title="Record Session Summary & Action Items">
        <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Session Summary & Action Items</label>
            <textarea
              required
              rows={4}
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="Record discussed topics, agreed action items, and next steps..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setNotesModalOpen(null)} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold">Save Notes & Mark Completed</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
