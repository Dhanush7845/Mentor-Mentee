import React, { useEffect, useState } from 'react';
import { Layers, Calendar, CheckCircle2, Clock, Sparkles, ArrowRight, Target } from 'lucide-react';
import { api } from '../../services/api';
import { DevelopmentPlan, Milestone } from '../../types';
import { Badge } from '../../components/common/Badge';

export const DevelopmentPlanPage: React.FC = () => {
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await api.getDevelopmentPlan('me');
        setPlan(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, []);

  const milestones: Milestone[] = plan?.milestones || [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const overallProgress = milestones.length > 0
    ? Math.round((milestones.reduce((acc, m) => acc + (m.completionPercent || 0), 0)) / milestones.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Career Development Roadmap
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {plan?.title || 'AI & Systems Curriculum Roadmap'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {plan?.overview || 'A 16-week structured milestone roadmap designed by your mentor to take you from foundational understanding to tier-1 frontier lab candidate.'}
            </p>
          </div>

          <div className="dark-card p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center shrink-0 w-44">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roadmap Health</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{overallProgress}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{completedCount} of {milestones.length} Milestones</div>
          </div>
        </div>

        {/* Global Roadmap Progress Bar */}
        <div className="mt-6 w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Milestone Cards Timeline */}
      <div className="space-y-4">
        {milestones.map((ms, index) => {
          const isDone = ms.status === 'completed';
          const isInProgress = ms.status === 'in_progress';

          return (
            <div
              key={ms.id}
              className={`dark-card p-6 border rounded-2xl transition-all ${
                isInProgress
                  ? 'bg-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-950/20'
                  : isDone
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isInProgress
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${index + 1}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base text-white">{ms.title}</h3>
                      <Badge
                        variant={isDone ? 'emerald' : isInProgress ? 'indigo' : 'slate'}
                        size="sm"
                      >
                        {ms.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{ms.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Target Date: {ms.targetDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-36 text-right shrink-0">
                  <span className="text-xs font-bold text-white">{ms.completionPercent}% Complete</span>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      style={{ width: `${ms.completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Linked Items */}
              {((ms.linkedRecommendations && ms.linkedRecommendations.length > 0) ||
                (ms.linkedTasks && ms.linkedTasks.length > 0)) && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-500 font-semibold">Linked Focus Deliverables:</span>
                  {ms.linkedRecommendations?.map((rId) => (
                    <span key={rId} className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/30">
                      Rec #{rId}
                    </span>
                  ))}
                  {ms.linkedTasks?.map((tId) => (
                    <span key={tId} className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                      Task #{tId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
