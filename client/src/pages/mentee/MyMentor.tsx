import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, Calendar, MessageSquare, Clock, CheckCircle2,
  AlertTriangle, RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const MyMentor: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [reason, setReason] = useState('Career specialization realignment');
  const [targetDomain, setTargetDomain] = useState('Cloud & Distributed Systems');
  const [notes, setNotes] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await api.getAssignedMentor();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, []);

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requestMentorChange({ reason, targetDomain, notes });
      showToast('Mentor change request dispatched to program administration', 'success');
      setChangeModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Request failed', 'error');
    }
  };

  const mentor = data?.mentor;
  const assignment = data?.assignment;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Assigned Mentor</h1>
          <p className="text-xs text-slate-400 mt-0.5">Your designated faculty / industry mentor</p>
        </div>

        {data?.assigned && (
          <button
            onClick={() => setChangeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Request Mentor Change
          </button>
        )}
      </div>

      {data?.assigned ? (
        <div className="space-y-6">
          <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start gap-6">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl shrink-0"
            />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-white">{mentor.name}</h2>
                  <Badge variant="emerald" size="sm">Active Mentor</Badge>
                </div>
                <p className="text-sm font-semibold text-cyan-400">
                  {mentor.profile?.title || 'Principal Research Scientist'}
                </p>
                <p className="text-xs text-slate-400">
                  {mentor.profile?.organization || 'Google DeepMind'} • {mentor.department}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {mentor.profile?.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  ★ {mentor.profile?.rating || '4.95'} <span className="text-slate-500 font-normal">rating</span>
                </span>
                <span className="text-slate-400">
                  <strong>{mentor.profile?.yearsExperience || 12}</strong> years industry experience
                </span>
                <span className="text-slate-400">
                  <strong>{mentor.profile?.totalSessionsHeld || 48}</strong> sessions completed
                </span>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 w-full md:w-44 shrink-0">
              <Link
                to="/mentee/messages"
                className="flex-1 py-2.5 px-4 rounded-xl text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
              <Link
                to="/mentee/sessions"
                className="flex-1 py-2.5 px-4 rounded-xl text-center text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" /> Book Session
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark-card p-6 border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Transparent Matching Rationale
                </span>
                <Badge variant="cyan" size="sm">{assignment?.matchScore || 96}% Compatibility</Badge>
              </div>
              <ul className="space-y-2 text-xs">
                {assignment?.matchReasons?.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dark-card p-6 border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Weekly Office Hours
                </span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Available Days:</span>
                  <span className="font-semibold text-white">
                    {mentor.profile?.availability?.days?.join(', ') || 'Monday, Thursday'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Meeting Window:</span>
                  <span className="font-semibold text-white">
                    {mentor.profile?.availability?.hours || '16:00 - 19:00 EST'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Format:</span>
                  <Badge variant="indigo" size="sm">{mentor.profile?.availability?.format || 'Online Video'}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dark-card p-12 border border-slate-800 bg-slate-900 text-center rounded-2xl">
          <p className="text-sm text-slate-300 mb-2 font-bold">No Mentor Assigned Yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Your profile is under review by the program coordinator.
          </p>
          <Link
            to="/mentee/onboarding"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Review Onboarding Profile
          </Link>
        </div>
      )}

      <Modal
        isOpen={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
        title="Request Mentor Reassignment"
        subtitle="Submitted directly to the program administrative office"
      >
        <form onSubmit={handleRequestChange} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Mentor change requests are reviewed impartially based on domain specialization and availability.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Reassignment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
            >
              <option value="Career specialization realignment">Career specialization realignment</option>
              <option value="Scheduling and timezone incompatibility">Scheduling and timezone incompatibility</option>
              <option value="Transition to different research subfield">Transition to different research subfield</option>
              <option value="Other administrative considerations">Other administrative considerations</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Desired Department / Domain</label>
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Additional Explanatory Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide background context for the administrative coordinator..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setChangeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-500 text-xs font-bold"
            >
              Submit Reassignment Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
