import React, { useEffect, useState } from 'react';
import {
  FileCheck2, Plus, CheckCircle2, Clock, ExternalLink,
  MessageSquare, Edit3, Trash2, Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Task } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<any>('medium');
  const [dueDate, setDueDate] = useState('');

  // Review modal
  const [reviewTask, setReviewTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState('');
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [tData, aData] = await Promise.all([
        api.getTasks(),
        api.getAssignedMentees()
      ]);
      setTasks(tData);
      setAssigned(aData);
      if (aData.length > 0 && !menteeId) {
        setMenteeId(aData[0].mentee.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeId || !title) return;
    try {
      await api.createTask({ menteeId, title, description, priority, dueDate });
      showToast('Task assigned to mentee', 'success');
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTask) return;
    try {
      await api.reviewTask(reviewTask.id, { feedback, status: 'completed' });
      showToast('Task review & feedback saved', 'success');
      setReviewTask(null);
      setFeedback('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Task & Deliverable Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Assign technical tasks with deadlines, review submitted code artifacts, and provide assessments
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Assign New Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((t) => {
          const isDone = t.status === 'completed';
          const isOverdue = t.status === 'overdue';

          return (
            <div
              key={t.id}
              className={`dark-card p-5 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                isDone
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : isOverdue
                  ? 'bg-slate-900 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{t.title}</span>
                  <Badge variant={t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'amber' : 'indigo'} size="sm">
                    {t.priority}
                  </Badge>
                  <Badge variant={isDone ? 'emerald' : isOverdue ? 'rose' : 'cyan'} size="sm">
                    {t.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">{t.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span>Due: {t.dueDate}</span>
                  {t.evidenceUrl && (
                    <a
                      href={t.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Submitted Artifact <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {t.submissionNotes && (
                    <span className="text-slate-300">Notes: "{t.submissionNotes}"</span>
                  )}
                </div>
                {t.feedback && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 mt-1">
                    <strong>Feedback:</strong> {t.feedback}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => { setReviewTask(t); setFeedback(t.feedback || ''); }}
                  className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  {isDone ? 'Update Feedback' : 'Review & Evaluate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Assign Technical Task"
        subtitle="Specify measurable requirements and deadlines"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Mentee</label>
            <select
              required
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {assigned.map((a) => (
                <option key={a.mentee.id} value={a.mentee.id}>
                  {a.mentee.name} ({a.mentee.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Transformer Attention from scratch"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deliverable Requirements</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact testing standards, constraints, and instructions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
            >
              Assign Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Review & Evaluate Deliverable Modal */}
      <Modal
        isOpen={!!reviewTask}
        onClose={() => setReviewTask(null)}
        title="Review & Grade Deliverable"
        subtitle={`Task: "${reviewTask?.title}"`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          {reviewTask?.evidenceUrl && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted Artifact URL:</span>
                <a href={reviewTask.evidenceUrl} target="_blank" rel="noreferrer" className="text-cyan-400 font-mono underline">
                  {reviewTask.evidenceUrl}
                </a>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Mentor Assessment & Feedback</label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive technical critique, highlight strengths, note areas for improvement..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewTask(null)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Feedback & Verify
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
