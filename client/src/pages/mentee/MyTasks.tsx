import React, { useEffect, useState } from 'react';
import {
  FileCheck2, CheckCircle2, Clock, AlertCircle, ExternalLink,
  Upload, Filter, MessageSquare, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Task } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const { showToast } = useToast();

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTask) return;
    try {
      await api.submitTaskEvidence(submitTask.id, { evidenceUrl, submissionNotes });
      showToast('Task deliverables submitted for mentor review!', 'success');
      setSubmitTask(null);
      setEvidenceUrl('');
      setSubmissionNotes('');
      loadTasks();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Assigned Tasks</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deliverables and technical milestones assigned by your mentor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tasks ({tasks.length})</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="dark-card p-12 text-center border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl">
            <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No tasks matching current filter</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isCompleted = t.status === 'completed';
            const isOverdue = t.status === 'overdue';

            const priorityBadge: Record<string, 'rose' | 'amber' | 'indigo' | 'slate'> = {
              urgent: 'rose',
              high: 'amber',
              medium: 'indigo',
              low: 'slate'
            };

            return (
              <div
                key={t.id}
                className={`dark-card p-5 border rounded-2xl transition-all ${
                  isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : isOverdue
                    ? 'bg-slate-900 border-rose-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{t.title}</span>
                      <Badge variant={priorityBadge[t.priority] || 'indigo'} size="sm">
                        {t.priority}
                      </Badge>
                      <Badge
                        variant={isCompleted ? 'emerald' : isOverdue ? 'rose' : 'cyan'}
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{t.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Due: {t.dueDate}
                      </span>
                      {t.evidenceUrl && (
                        <a
                          href={t.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          View Submitted Code/Artifact <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Mentor feedback snippet if available */}
                    {t.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                        <span className="font-bold text-[10px] uppercase">Mentor Assessment:</span>
                        <p className="text-slate-200">{t.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {!isCompleted ? (
                      <button
                        onClick={() => {
                          setSubmitTask(t);
                          setEvidenceUrl(t.evidenceUrl || '');
                          setSubmissionNotes(t.submissionNotes || '');
                        }}
                        className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Submit Work
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Evidence Modal */}
      <Modal
        isOpen={!!submitTask}
        onClose={() => setSubmitTask(null)}
        title="Submit Task Deliverable"
        subtitle={`For: "${submitTask?.title}"`}
      >
        <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Deliverable URL (GitHub repo, PR, arXiv draft, or document)
            </label>
            <input
              type="url"
              required
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://github.com/alexchen-ml/attention-from-scratch"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Submission Notes & Results
            </label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Summarize your test results, benchmarks, or key learnings..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSubmitTask(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Complete & Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
