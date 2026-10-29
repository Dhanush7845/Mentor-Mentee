import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, GraduationCap, Target, Award, Lock, Plus, FileText,
  MessageSquare, Compass, FileCheck2, ExternalLink, Calendar,
  ArrowLeft, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const MenteeProfileDetails: React.FC = () => {
  const { menteeId } = useParams<{ menteeId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    if (!menteeId) return;
    try {
      const res = await api.getMenteeDetails(menteeId);
      setData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load mentee details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [menteeId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !menteeId) return;
    try {
      await api.addMentorNote(menteeId, noteContent.trim());
      showToast('Private mentor note recorded', 'success');
      setNoteContent('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save note', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeId) return;
    try {
      await api.createTask({
        menteeId,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate
      });
      showToast('Task assigned to mentee', 'success');
      setTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading mentee profile...</div>;
  }

  const mentee = data?.user;
  const profile = data?.profile;
  const notes = data?.privateNotes || [];
  const skillGaps = data?.skillGaps || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <Link
          to="/mentor/assigned"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assigned Mentees
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Assign Task
          </button>
          <Link
            to="/mentor/recommendations"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" /> New Recommendation
          </Link>
          <Link
            to="/mentor/messages"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> Message
          </Link>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={mentee?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={mentee?.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{mentee?.name}</h1>
              <Badge variant="cyan" size="sm">Assigned Mentee</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {profile?.currentDegree} • {profile?.college || mentee?.department}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span>Email: {mentee?.email}</span>
              <span>Target Role: <strong className="text-white">{profile?.targetRole}</strong></span>
            </div>
          </div>
        </div>

        {/* Resume Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs shrink-0 w-full md:w-56 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Resume Attached:</span>
            <Badge variant="emerald" size="sm">Verified</Badge>
          </div>
          <p className="font-mono text-[11px] text-cyan-400 truncate">{profile?.resumeName || 'Resume.pdf'}</p>
        </div>
      </div>

      {/* Grid: Details on Left, Private Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Education, Skill Gaps, Goals */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skill Gaps Analysis */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Skill Gaps & Development Needs
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-2">Identified Skill Gaps (To Target):</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.length > 0 ? (
                    skillGaps.map((g: string) => (
                      <span key={g} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                        ⚠️ {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-400">All target skills currently verified!</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-2">Verified Current Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.skills?.map((s: string) => (
                    <Badge key={s} variant="indigo" size="md">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" /> Background & Experience
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Internships:</span>
                <p className="text-slate-200 mt-0.5">{profile?.previousInternships || 'None recorded'}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Academic Projects:</span>
                <p className="text-slate-200 mt-0.5">{profile?.academicProjects || 'None recorded'}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Short-Term Goal:</span>
                <p className="text-slate-200 mt-0.5">{profile?.shortTermGoals}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Long-Term Goal:</span>
                <p className="text-slate-200 mt-0.5">{profile?.longTermGoals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: STRICTLY PRIVATE MENTOR NOTES */}
        <div className="space-y-6 lg:col-span-1">
          <div className="dark-card p-6 border border-amber-500/30 bg-slate-900 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Private Mentor Notes</h3>
              </div>
              <Badge variant="amber" size="sm">Confidential</Badge>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              These notes are strictly private to you as the assigned mentor (and program administrators). They are never visible to the mentee.
            </p>

            <form onSubmit={handleAddNote} className="space-y-3 mb-6">
              <textarea
                required
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Record observation on technical depth, demeanor, interview readiness..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Save Private Note
              </button>
            </form>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No private notes recorded yet.</p>
              ) : (
                notes.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <p className="text-slate-300 leading-relaxed">{n.note}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="Assign New Task"
        subtitle={`For mentee: ${mentee?.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement Multi-GPU Distributed Training Benchmark"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description & Requirements</label>
            <textarea
              required
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Specify requirements, deliverables, and unit test criteria..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
            >
              Assign Deliverable
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
