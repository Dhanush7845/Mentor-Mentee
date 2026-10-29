import React, { useEffect, useState } from 'react';
import {
  Compass, Plus, ExternalLink, MessageCircleQuestion,
  CheckCircle2, Clock, Trash2, Edit2, Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Recommendation, RecommendationStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const RecommendationManagement: React.FC = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Courses');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [learningOutcome, setLearningOutcome] = useState('');
  const [difficulty, setDifficulty] = useState<any>('Advanced');
  const [priority, setPriority] = useState<any>('high');
  const [estimatedHours, setEstimatedHours] = useState(20);
  const [dueDate, setDueDate] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [status, setStatus] = useState<any>('published');
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [rData, aData] = await Promise.all([
        api.getRecommendations(),
        api.getAssignedMentees()
      ]);
      setRecs(rData);
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
      await api.createRecommendation({
        menteeId,
        title,
        category,
        description,
        reason,
        learningOutcome,
        difficulty,
        priority,
        estimatedHours: Number(estimatedHours),
        dueDate,
        resourceUrl,
        status
      });
      showToast('Recommendation created successfully!', 'success');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setReason('');
      setLearningOutcome('');
      setResourceUrl('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create recommendation', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: RecommendationStatus) => {
    try {
      await api.updateRecommendationStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const categories = [
    'Courses', 'Certifications', 'Technical skills', 'Soft skills',
    'Projects', 'Internships', 'Job opportunities', 'Interview preparation',
    'Books and learning resources', 'Career guidance', 'Networking opportunities'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Recommendation Workspace</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate, publish, and monitor technical resources and project recommendations for your assigned mentees
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Create Recommendation
        </button>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recs.map((r) => {
          const statusBadge: Record<string, 'indigo' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate'> = {
            published: 'indigo',
            accepted: 'cyan',
            in_progress: 'amber',
            completed: 'emerald',
            declined: 'rose',
            draft: 'slate'
          };

          return (
            <div
              key={r.id}
              className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">{r.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge[r.status] || 'indigo'} size="sm">
                      {r.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={r.priority === 'urgent' ? 'rose' : r.priority === 'high' ? 'amber' : 'indigo'} size="sm">
                      {r.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{r.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: <strong className="text-slate-200">{r.menteeName}</strong></p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {r.description}
                </p>

                {r.learningOutcome && (
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium block">Learning Outcome:</span>
                    <p className="text-emerald-400/90 font-medium mt-0.5">{r.learningOutcome}</p>
                  </div>
                )}

                {r.clarificationNotes && (
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                    <span className="font-bold text-[10px] uppercase">Mentee Discussion:</span>
                    <p className="whitespace-pre-line text-slate-200">{r.clarificationNotes}</p>
                  </div>
                )}
              </div>

              {/* Status Controls */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Due: {r.dueDate || 'Flexible'} ({r.estimatedHours}h)</span>
                  {r.resourceUrl && (
                    <a href={r.resourceUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                      Resource Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {r.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(r.id, 'published')}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    >
                      Publish to Mentee
                    </button>
                  )}
                  {r.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(r.id, 'completed')}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500">Status: {r.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Recommendation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Recommendation"
        subtitle="Formulate structured learning paths for your mentee"
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
            <label className="block text-slate-300 font-semibold mb-1">Recommendation Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Vector Search Architecture & Benchmarks"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Challenging">Challenging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of what the mentee should study or build..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Recommendation</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this is critical for their career goals..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Expected Learning Outcome</label>
            <input
              type="text"
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              placeholder="e.g. Master GPU kernel memory tiling..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
              <label className="block text-slate-300 font-semibold mb-1">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Resource URL</label>
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="https://pytorch.org/tutorials"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Publication State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="published">Publish Immediately to Mentee</option>
              <option value="draft">Save as Draft (Private)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
            >
              Save Recommendation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
