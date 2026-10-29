import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, Award, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const MentorApproval: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const data = await api.getMentorApprovals();
      setPending(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (id: string, decision: 'approve' | 'reject') => {
    try {
      await api.handleMentorApproval(id, decision);
      showToast(`Mentor application ${decision === 'approve' ? 'approved' : 'rejected'}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Registration Approvals</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Inspect credentials, professional expertise, and verify new mentor applicants
        </p>
      </div>

      <div className="space-y-4">
        {pending.length === 0 ? (
          <div className="dark-card p-12 text-center border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No pending mentor applications</p>
            <p className="text-xs text-slate-400 mt-1">All registrations have been reviewed.</p>
          </div>
        ) : (
          pending.map((m) => (
            <div key={m.id} className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{m.name}</h3>
                      <Badge variant="amber" size="sm">Pending Review</Badge>
                    </div>
                    <p className="text-xs text-cyan-400 font-medium">{m.profile?.title || 'VP of Cloud Infrastructure'}</p>
                    <p className="text-xs text-slate-400">{m.department} • {m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision(m.id, 'approve')}
                    className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <Check className="w-4 h-4" /> Approve Mentor
                  </button>
                  <button
                    onClick={() => handleDecision(m.id, 'reject')}
                    className="py-2 px-4 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300">{m.profile?.bio || 'Veteran engineering leader focusing on cloud systems.'}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.profile?.expertise?.map((e: string) => (
                    <Badge key={e} variant="indigo" size="sm">{e}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
