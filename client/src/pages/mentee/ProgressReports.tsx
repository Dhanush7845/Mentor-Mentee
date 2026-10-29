import React, { useEffect, useState } from 'react';
import { Activity, Plus, CheckCircle2, Calendar, FileText, Send, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ProgressReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState('October 2026 (Weeks 3 & 4)');
  const [summary, setSummary] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [evidenceLinks, setEvidenceLinks] = useState('');
  const { showToast } = useToast();

  const loadReports = async () => {
    try {
      const data = await api.getProgressReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitProgressReport({ period, summary, achievements, challenges, evidenceLinks });
      showToast('Progress report dispatched to mentor', 'success');
      setModalOpen(false);
      setSummary('');
      setAchievements('');
      setChallenges('');
      setEvidenceLinks('');
      loadReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Progress Reports & Reflections</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit periodic reflection logs, project evidence links, and review mentor assessments
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Submit Progress Report
        </button>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="dark-card p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
            <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No progress reports filed yet</p>
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{r.period}</h3>
                  <Badge variant="cyan" size="sm">Submitted</Badge>
                </div>
                <span className="text-[11px] text-slate-500">{new Date(r.submittedAt).toLocaleDateString()}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Summary of Work Done:</span>
                  <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">{r.summary}</p>
                </div>

                {r.achievements && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Key Achievements:</span>
                    <p className="text-emerald-400/90 bg-slate-950 p-2.5 rounded-xl border border-slate-800">{r.achievements}</p>
                  </div>
                )}

                {r.challenges && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Challenges / Roadblocks:</span>
                    <p className="text-amber-400/90 bg-slate-950 p-2.5 rounded-xl border border-slate-800">{r.challenges}</p>
                  </div>
                )}

                {r.evidenceLinks && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Evidence & Project Links:</span>
                    <p className="text-cyan-400 font-mono text-[11px] break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">{r.evidenceLinks}</p>
                  </div>
                )}

                {r.mentorFeedback && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                    <span className="text-indigo-300 font-bold block mb-1">Mentor Feedback & Next Steps:</span>
                    <p className="text-slate-200">{r.mentorFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Report Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Periodic Progress Report"
        subtitle="Shared with your mentor and program coordinator"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reporting Period</label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Milestone Progress Summary</label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What tasks and learning objectives did you tackle during this period?..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Key Achievements & Highlights</label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Passed all test suites, completed paper reading, etc."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Challenges & Areas Needing Assistance</label>
            <input
              type="text"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Trouble debugging multi-GPU synchronization..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Evidence Links (GitHub, demo video, arXiv)</label>
            <textarea
              rows={2}
              value={evidenceLinks}
              onChange={(e) => setEvidenceLinks(e.target.value)}
              placeholder="https://github.com/alexchen/project"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
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
              Submit Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
