import React, { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Clock, Calendar, Edit3, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Goal } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const GoalsMilestones: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'short_term' | 'long_term'>('short_term');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const { showToast } = useToast();

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal({ title, type, targetDate, notes });
      showToast('New career goal added', 'success');
      setModalOpen(false);
      setTitle('');
      setNotes('');
      loadGoals();
    } catch (err: any) {
      showToast(err.message || 'Failed to add goal', 'error');
    }
  };

  const handleUpdateProgress = async (id: string, progressPercent: number) => {
    try {
      await api.updateGoal(id, {
        progressPercent,
        status: progressPercent === 100 ? 'completed' : 'in_progress'
      });
      loadGoals();
    } catch (err) {
      // ignore
    }
  };

  const shortTerm = goals.filter((g) => g.type === 'short_term');
  const longTerm = goals.filter((g) => g.type === 'long_term');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Goals & Measurable Milestones</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track short-term targets and long-term career aspirations
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add Career Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Short Term Goals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Short-Term Goals (Next 3-6 Mos)
            </h2>
            <Badge variant="cyan" size="sm">{shortTerm.length} Goals</Badge>
          </div>

          <div className="space-y-3">
            {shortTerm.map((g) => (
              <div key={g.id} className="dark-card p-5 border border-slate-800 bg-slate-900 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs font-bold text-white">{g.title}</h4>
                  <Badge variant={g.progressPercent === 100 ? 'emerald' : 'indigo'} size="sm">
                    {g.progressPercent}%
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400">Target Date: {g.targetDate || 'Flexible'}</div>
                {g.notes && <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{g.notes}</p>}

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progress Slider</span>
                    <span>{g.progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progressPercent}
                    onChange={(e) => handleUpdateProgress(g.id, Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Long Term Goals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Long-Term Vision (1-3 Years)
            </h2>
            <Badge variant="indigo" size="sm">{longTerm.length} Goals</Badge>
          </div>

          <div className="space-y-3">
            {longTerm.map((g) => (
              <div key={g.id} className="dark-card p-5 border border-slate-800 bg-slate-900 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs font-bold text-white">{g.title}</h4>
                  <Badge variant={g.progressPercent === 100 ? 'emerald' : 'indigo'} size="sm">
                    {g.progressPercent}%
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400">Target Date: {g.targetDate || 'Flexible'}</div>
                {g.notes && <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{g.notes}</p>}

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progress Slider</span>
                    <span>{g.progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progressPercent}
                    onChange={(e) => handleUpdateProgress(g.id, Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Career Goal"
        subtitle="Set measurable targets with your mentor"
      >
        <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master GPU kernel profiling or complete paper draft"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Time Horizon</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="short_term">Short-Term (3-6 Mos)</option>
                <option value="long_term">Long-Term (1-3 Yrs)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Action Plan & Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key milestones or resources to accomplish this..."
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
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
