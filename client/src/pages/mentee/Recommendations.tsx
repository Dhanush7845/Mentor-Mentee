import React, { useEffect, useState } from 'react';
import {
  Compass, ExternalLink, MessageCircleQuestion, Check, X,
  Clock, AlertCircle, FileText, CheckCircle2, Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Recommendation, RecommendationStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const Recommendations: React.FC = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Clarification modal state
  const [clarifyRec, setClarifyRec] = useState<Recommendation | null>(null);
  const [question, setQuestion] = useState('');
  const { showToast } = useToast();

  const loadRecs = async () => {
    try {
      const data = await api.getRecommendations();
      setRecs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, []);

  const handleStatusChange = async (id: string, status: RecommendationStatus) => {
    try {
      await api.updateRecommendationStatus(id, status);
      showToast(`Recommendation marked as ${status}`, 'success');
      loadRecs();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleClarifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyRec || !question.trim()) return;
    try {
      await api.clarifyRecommendation(clarifyRec.id, question.trim());
      showToast('Clarification request dispatched to your mentor', 'success');
      setClarifyRec(null);
      setQuestion('');
      loadRecs();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit', 'error');
    }
  };

  const categories = ['all', 'Courses', 'Projects', 'Certifications', 'Interview preparation', 'Books and learning resources'];

  const filteredRecs = recs.filter((r) => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Recommendations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated opportunities, courses, projects, and interview preparation items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">New / Published</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRecs.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
            <Compass className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No recommendations found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching the filters above.</p>
          </div>
        ) : (
          filteredRecs.map((r) => {
            const statusVariants: Record<string, 'emerald' | 'cyan' | 'indigo' | 'amber' | 'rose' | 'slate'> = {
              published: 'indigo',
              accepted: 'cyan',
              in_progress: 'amber',
              completed: 'emerald',
              declined: 'rose'
            };

            return (
              <div
                key={r.id}
                className="dark-card p-6 border border-slate-800 bg-slate-900 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">{r.category}</span>
                    <Badge variant={statusVariants[r.status] || 'slate'} size="sm">
                      {r.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{r.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>By {r.mentorName}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">Difficulty: {r.difficulty}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">Est: {r.estimatedHours}h</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {r.description}
                  </p>

                  {r.reason && (
                    <div className="text-xs">
                      <span className="text-slate-500 font-medium block">Reason for Recommendation:</span>
                      <p className="text-slate-300 mt-0.5">{r.reason}</p>
                    </div>
                  )}

                  {r.learningOutcome && (
                    <div className="text-xs">
                      <span className="text-slate-500 font-medium block">Expected Learning Outcome:</span>
                      <p className="text-emerald-400/90 font-medium mt-0.5">{r.learningOutcome}</p>
                    </div>
                  )}

                  {r.clarificationNotes && (
                    <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                      <span className="font-bold text-[10px] uppercase">Discussion / Clarification:</span>
                      <p className="whitespace-pre-line text-slate-300">{r.clarificationNotes}</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls & Due Date */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Due: {r.dueDate || 'Flexible'}
                    </span>
                    {r.resourceUrl && (
                      <a
                        href={r.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        Resource Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Mentee Action Workflow Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {r.status === 'published' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(r.id, 'accepted')}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(r.id, 'declined')}
                          className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    )}

                    {r.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'in_progress')}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1"
                      >
                        Start Recommendation
                      </button>
                    )}

                    {r.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'completed')}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Completed
                      </button>
                    )}

                    <button
                      onClick={() => { setClarifyRec(r); setQuestion(''); }}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <MessageCircleQuestion className="w-3.5 h-3.5 text-cyan-400" /> Clarify
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clarification Dialog Modal */}
      <Modal
        isOpen={!!clarifyRec}
        onClose={() => setClarifyRec(null)}
        title="Request Clarification"
        subtitle={`Regarding "${clarifyRec?.title}"`}
      >
        <form onSubmit={handleClarifySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              What questions or adjustments do you have for your mentor?
            </label>
            <textarea
              required
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should I focus on the CPU inference engine first, or jump directly into the Triton kernel profiling?..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClarifyRec(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Send Question to Mentor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
