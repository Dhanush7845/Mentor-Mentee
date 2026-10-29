import React, { useEffect, useState } from 'react';
import { Layers, Plus, Save, Trash2, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Milestone } from '../../types';
import { Badge } from '../../components/common/Badge';

export const DevelopmentPlanBuilder: React.FC = () => {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const aData = await api.getAssignedMentees();
      setAssigned(aData);
      if (aData.length > 0) {
        const firstId = aData[0].mentee.id;
        setSelectedMenteeId(firstId);
        await loadPlanForMentee(firstId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanForMentee = async (mId: string) => {
    try {
      const p = await api.getDevelopmentPlan(mId);
      if (p) {
        setTitle(p.title || 'Curriculum Roadmap');
        setOverview(p.overview || '');
        setMilestones(p.milestones || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMenteeChange = (mId: string) => {
    setSelectedMenteeId(mId);
    loadPlanForMentee(mId);
  };

  const addMilestone = () => {
    const newMs: Milestone = {
      id: 'ms_' + Date.now(),
      title: 'New Milestone Stage',
      targetDate: '2026-12-01',
      status: 'upcoming',
      completionPercent: 0,
      description: 'Define key learning objectives and deliverables for this stage.'
    };
    setMilestones([...milestones, newMs]);
  };

  const updateMilestone = (index: number, field: string, val: any) => {
    const updated = [...milestones];
    (updated[index] as any)[field] = val;
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await api.saveDevelopmentPlan({
        menteeId: selectedMenteeId,
        title,
        overview,
        milestones
      });
      showToast('Roadmap saved and synchronized with mentee portal!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save roadmap', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Development Plan Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct structured curriculum milestones and roadmaps for your assigned mentees
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMenteeId}
            onChange={(e) => handleMenteeChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            {assigned.map((a) => (
              <option key={a.mentee.id} value={a.mentee.id}>
                Mentee: {a.mentee.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" /> Save Roadmap
          </button>
        </div>
      </div>

      {/* Plan Header Form */}
      <div className="dark-card p-6 border border-slate-800 bg-slate-900 rounded-2xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Roadmap Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Strategic Overview & Vision</label>
          <textarea
            rows={2}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
          />
        </div>
      </div>

      {/* Milestones Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" /> Roadmap Milestones ({milestones.length})
          </h2>
          <button
            onClick={addMilestone}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone Stage
          </button>
        </div>

        <div className="space-y-4">
          {milestones.map((ms, idx) => (
            <div key={ms.id || idx} className="dark-card p-5 border border-slate-800 bg-slate-900 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Stage 0{idx + 1}</span>
                <button
                  onClick={() => removeMilestone(idx)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Stage Title</label>
                  <input
                    type="text"
                    value={ms.title}
                    onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={ms.targetDate}
                    onChange={(e) => updateMilestone(idx, 'targetDate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 font-semibold mb-1">Milestone Description & Scope</label>
                <textarea
                  rows={2}
                  value={ms.description}
                  onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Stage Status</label>
                  <select
                    value={ms.status}
                    onChange={(e) => updateMilestone(idx, 'status', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Completion % ({ms.completionPercent}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ms.completionPercent}
                    onChange={(e) => updateMilestone(idx, 'completionPercent', Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
