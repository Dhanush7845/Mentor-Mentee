import React, { useEffect, useState } from 'react';
import { Award, FileText, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const ProgressAssessments: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rep, ass] = await Promise.all([
          api.getProgressReports(),
          api.getAssignedMentees()
        ]);
        setReports(rep);
        setAssigned(ass);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentee Progress Assessments</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review mentee-submitted reflection reports, examine artifacts, and provide feedback
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{r.period}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Submitted by Alex Chen</h3>
              </div>
              <span className="text-[11px] text-slate-500">{new Date(r.submittedAt).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
              <strong>Work Summary:</strong> {r.summary}
            </p>

            {r.achievements && (
              <p className="text-xs text-emerald-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong>Achievements:</strong> {r.achievements}
              </p>
            )}

            {r.evidenceLinks && (
              <div className="text-xs text-slate-400">
                <span className="font-semibold block mb-0.5">Project Links:</span>
                <span className="font-mono text-cyan-400">{r.evidenceLinks}</span>
              </div>
            )}

            {r.mentorFeedback && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
                <strong>Your Assessment:</strong> {r.mentorFeedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
