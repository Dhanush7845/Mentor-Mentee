import React, { useEffect, useState } from 'react';
import { 
  GitPullRequest, Sparkles, CheckCircle2, UserCheck, AlertCircle, 
  Search, ArrowRight, UserMinus, Award, RefreshCw, PlusCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { StatsCard } from '../../components/common/StatsCard';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const MatchingManagement: React.FC = () => {
  const [data, setData] = useState<any>({ unassignedMentees: [], activeAssignments: [], matchRecommendations: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'assignments'>('recommendations');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  
  const [selectedPair, setSelectedPair] = useState<{ mentee: any; mentor: any } | null>(null);
  const [pairNotes, setPairNotes] = useState('High compatibility based on skill set and department alignment.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [manualMenteeId, setManualMenteeId] = useState('');
  const [manualMentorId, setManualMentorId] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getMatchingOverview();
      setData(res);
      const users = await api.getAdminUsers();
      setAllUsers(users);
    } catch (err: any) {
      showToast(err.message || 'Failed to load matching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmPairing = async () => {
    if (!selectedPair) return;
    try {
      setIsSubmitting(true);
      await api.assignMentor({
        menteeId: selectedPair.mentee.id,
        mentorId: selectedPair.mentor.mentorId,
        matchScore: selectedPair.mentor.matchScore,
        matchReasons: selectedPair.mentor.reasons,
        notes: pairNotes
      });
      showToast(`Successfully paired ${selectedPair.mentee.name} with ${selectedPair.mentor.mentorName}!`, 'success');
      setSelectedPair(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Pairing failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMenteeId || !manualMentorId) {
      showToast('Please select both a mentee and mentor', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.assignMentor({
        menteeId: manualMenteeId,
        mentorId: manualMentorId,
        matchScore: 88,
        matchReasons: ['Administrative manual pairing'],
        notes: 'Paired via manual administrative console'
      });
      showToast('Pairing created successfully', 'success');
      setShowManualModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Pairing failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (assignmentId: string, menteeName: string) => {
    if (!window.confirm(`Unassign ${menteeName}? The mentee will return to the unassigned matching pool.`)) return;
    try {
      await api.unassignMentor(assignmentId);
      showToast(`Mentee ${menteeName} returned to matching pool`, 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to unassign', 'error');
    }
  };

  const unassignedCount = data.unassignedMentees?.length || 0;
  const activeCount = data.activeAssignments?.length || 0;
  const recs = data.matchRecommendations || [];
  const assignments = data.activeAssignments || [];

  const filteredRecs = recs.filter((item: any) => {
    const mentee = item.mentee;
    const matchesSearch = mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mentee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || mentee.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredAssignments = assignments.filter((item: any) => {
    const matchesSearch = item.menteeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.mentorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || item.menteeDepartment === deptFilter;
    return matchesSearch && matchesDept;
  });

  const menteesList = allUsers.filter(u => u.role === 'mentee' && u.status === 'active');
  const mentorsList = allUsers.filter(u => u.role === 'mentor' && u.status === 'active');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Explainable Algorithmic Matching
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Matching & Pairing Management
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Pair mentees with qualified mentors using skill overlap, departmental synergy, format preferences, and current capacity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Manual Pairing
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Unassigned Mentees"
          value={unassignedCount}
          icon={AlertCircle}
          trend={unassignedCount > 0 ? "Requires matching action" : "All mentees paired"}
          trendType={unassignedCount > 0 ? "warning" : "positive"}
        />
        <StatsCard
          title="Active Mentorships"
          value={activeCount}
          icon={GitPullRequest}
          trend="In active cohort"
          trendType="neutral"
        />
        <StatsCard
          title="Avg Compatibility"
          value="92%"
          icon={Award}
          trend="+4% from prior cohort"
          trendType="positive"
        />
        <StatsCard
          title="Mentor Pool Size"
          value={mentorsList.length}
          icon={UserCheck}
          trend="Approved mentors"
          trendType="neutral"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'recommendations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Smart Match Suggestions
            {unassignedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full font-bold">
                {unassignedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Active Pairings ({activeCount})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Data Science">Data Science</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {/* TAB 1: Smart Match Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {filteredRecs.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Active Mentees Are Paired"
              description="No unassigned mentees currently require matching. Great job keeping the cohort balanced!"
            />
          ) : (
            filteredRecs.map((item: any) => {
              const mentee = item.mentee;
              const suggestions = item.suggestedMentors || [];
              const targetSkills = mentee.profile?.targetSkills || ['React', 'System Design'];

              return (
                <div key={mentee.id} className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Mentee Profile Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-4">
                      <img
                        src={mentee.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop`}
                        alt={mentee.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{mentee.name}</h3>
                          <Badge variant="warning">Unassigned</Badge>
                          <span className="text-xs text-slate-400 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                            {mentee.department || 'Engineering'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{mentee.email}</p>
                        <p className="text-xs text-slate-500 mt-1 italic">
                          Goal: "{mentee.profile?.careerGoals || 'Transition to Senior Full-Stack Engineering'}"
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                      <span className="text-xs text-slate-400 mr-1">Target Skills:</span>
                      {targetSkills.map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Matching Mentors */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Algorithmic Match Suggestions ({suggestions.length} Qualified Mentors)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestions.slice(0, 3).map((mentorMatch: any) => {
                        const score = mentorMatch.matchScore;
                        const scoreColor = score >= 90 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                           score >= 75 ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' :
                                                         'text-amber-400 border-amber-500/30 bg-amber-500/10';
                        return (
                          <div
                            key={mentorMatch.mentorId}
                            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={mentorMatch.mentorAvatar || `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop`}
                                    alt={mentorMatch.mentorName}
                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                                  />
                                  <div>
                                    <h5 className="text-sm font-bold text-white leading-tight">{mentorMatch.mentorName}</h5>
                                    <p className="text-xs text-slate-400 leading-tight">{mentorMatch.mentorTitle}</p>
                                  </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${scoreColor}`}>
                                  {score}% Match
                                </div>
                              </div>

                              <div className="text-xs mb-3 flex items-center justify-between text-slate-400">
                                <span>Department: <strong className="text-slate-300">{mentorMatch.department}</strong></span>
                                <span className={mentorMatch.isCapacityFull ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                  {mentorMatch.isCapacityFull ? 'Full (0 open)' : `${mentorMatch.remainingCapacity} slots open`}
                                </span>
                              </div>

                              <div className="space-y-1.5 mb-4">
                                {mentorMatch.reasons?.map((r: string, rIdx: number) => (
                                  <div key={rIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                    <span className="text-indigo-400 mt-0.5">â€¢</span>
                                    <span>{r}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedPair({ mentee, mentor: mentorMatch });
                                setPairNotes(`Matched based on ${score}% compatibility score. ${mentorMatch.reasons?.[0] || ''}`);
                              }}
                              disabled={mentorMatch.isCapacityFull}
                              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                mentorMatch.isCapacityFull
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              {mentorMatch.isCapacityFull ? 'Capacity Reached' : 'Confirm Pairing'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Active Assignments */}
      {activeTab === 'assignments' && (
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mentee</th>
                  <th className="px-6 py-4 font-semibold">Assigned Mentor</th>
                  <th className="px-6 py-4 font-semibold">Compatibility</th>
                  <th className="px-6 py-4 font-semibold">Assigned Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No active assignments found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{a.menteeName}</div>
                        <div className="text-xs text-slate-400">{a.menteeEmail}</div>
                        <div className="text-xs text-indigo-400 mt-0.5">{a.menteeDepartment || 'Engineering'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{a.mentorName}</div>
                        <div className="text-xs text-slate-400">{a.mentorEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> {a.matchScore || 90}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnassign(a.id, a.menteeName)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-medium text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <UserMinus className="w-3.5 h-3.5" /> Unassign
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Pairing Modal */}
      {selectedPair && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPair(null)}
          title="Confirm Mentor-Mentee Pairing"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Mentee</p>
                <p className="text-sm font-bold text-white">{selectedPair.mentee.name}</p>
                <p className="text-xs text-slate-500">{selectedPair.mentee.department}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-400" />
              <div className="text-right">
                <p className="text-xs text-slate-400">Mentor</p>
                <p className="text-sm font-bold text-white">{selectedPair.mentor.mentorName}</p>
                <p className="text-xs text-emerald-400">{selectedPair.mentor.matchScore}% Match</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Pairing Justification & Notes
              </label>
              <textarea
                value={pairNotes}
                onChange={(e) => setPairNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              Both parties will automatically receive notifications and access to each other's workspaces and direct chat.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPairing}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
              >
                {isSubmitting ? 'Confirming...' : 'Approve & Activate Pairing'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Pairing Modal */}
      {showManualModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowManualModal(false)}
          title="Manual Mentor-Mentee Pairing"
        >
          <form onSubmit={handleManualPairing} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Select Mentee *
              </label>
              <select
                value={manualMenteeId}
                onChange={(e) => setManualMenteeId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Mentee --</option>
                {menteesList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email}) - {m.department || 'General'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Select Mentor *
              </label>
              <select
                value={manualMentorId}
                onChange={(e) => setManualMentorId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Mentor --</option>
                {mentorsList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email}) - {m.department || 'General'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
              >
                {isSubmitting ? 'Creating...' : 'Create Pairing'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
