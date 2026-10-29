import React, { useEffect, useState } from 'react';
import { 
  BarChart2, Users, AlertTriangle, CheckCircle, Scale, 
  Search, SlidersHorizontal, RefreshCw, TrendingUp
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatsCard } from '../../components/common/StatsCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const WorkloadManagement: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'at_capacity'>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [newMaxCapacity, setNewMaxCapacity] = useState<number>(3);
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkload();
      setMentors(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load workload data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalMentors = mentors.length;
  const atCapacityCount = mentors.filter(m => m.isAtCapacity).length;
  const availableCount = mentors.filter(m => !m.isAtCapacity).length;
  const totalMenteesAssigned = mentors.reduce((acc, m) => acc + (m.currentMentees || 0), 0);
  const totalMaxCapacity = mentors.reduce((acc, m) => acc + (m.maxMentees || 3), 0);
  const overallUtilization = totalMaxCapacity > 0 ? Math.round((totalMenteesAssigned / totalMaxCapacity) * 100) : 0;

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'available' && !m.isAtCapacity) ||
                          (statusFilter === 'at_capacity' && m.isAtCapacity);
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleUpdateCapacity = async () => {
    if (!selectedMentor) return;
    try {
      setIsUpdating(true);
      await api.updateAdminSettings({
        mentorMaxCapacityOverride: { mentorId: selectedMentor.mentorId, maxMentees: newMaxCapacity }
      });
      showToast(`Updated capacity for ${selectedMentor.name} to ${newMaxCapacity}`, 'success');
      setSelectedMentor(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update capacity', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" /> Capacity Balancer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mentor Workload & Capacity Management
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Monitor active mentee allocations, avoid mentor fatigue, and maintain optimal student-to-guide ratios across cohorts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Pool Utilization"
          value={`${overallUtilization}%`}
          icon={TrendingUp}
          trend={`${totalMenteesAssigned} of ${totalMaxCapacity} slots filled`}
          trendType={overallUtilization > 85 ? "warning" : "positive"}
        />
        <StatsCard
          title="Mentors At Capacity"
          value={atCapacityCount}
          icon={AlertTriangle}
          trend={atCapacityCount > 0 ? "Cannot accept new mentees" : "No overloaded mentors"}
          trendType={atCapacityCount > 0 ? "warning" : "positive"}
        />
        <StatsCard
          title="Available Mentors"
          value={availableCount}
          icon={CheckCircle}
          trend="Open for pairing"
          trendType="positive"
        />
        <StatsCard
          title="Total Assigned Mentees"
          value={totalMenteesAssigned}
          icon={Users}
          trend="Currently in guidance"
          trendType="neutral"
        />
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Mentors ({totalMentors})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'available'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Available Slots ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('at_capacity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'at_capacity'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            At Capacity ({atCapacityCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mentor or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
      </div>

      {/* Mentors Workload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMentors.map((m: any) => {
          const util = m.utilizationPercent || 0;
          const barColor = util >= 100 ? 'bg-rose-500' : util >= 66 ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div key={m.mentorId} className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">{m.name}</h3>
                  <p className="text-xs text-slate-400">{m.department || 'Engineering'}</p>
                </div>
                <Badge variant={m.isAtCapacity ? 'danger' : 'success'}>
                  {m.isAtCapacity ? 'At Capacity' : 'Available'}
                </Badge>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Capacity: {m.currentMentees} / {m.maxMentees} mentees</span>
                  <span className="text-white font-bold">{util}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>
              </div>

              {/* Slot Visualizer */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: m.maxMentees }).map((_, idx) => {
                  const isFilled = idx < m.currentMentees;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 py-1 px-2 rounded-lg text-center text-[10px] font-semibold border ${
                        isFilled
                          ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      {isFilled ? `Mentee ${idx + 1}` : 'Open Slot'}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Max limit: {m.maxMentees}</span>
                <button
                  onClick={() => {
                    setSelectedMentor(m);
                    setNewMaxCapacity(m.maxMentees || 3);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Limit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Capacity Modal */}
      {selectedMentor && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMentor(null)}
          title={`Adjust Capacity Limit for ${selectedMentor.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Set the maximum number of simultaneous mentees {selectedMentor.name} can accept into their mentorship track.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Maximum Mentees Allowed ({newMaxCapacity})
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={newMaxCapacity}
                onChange={(e) => setNewMaxCapacity(parseInt(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 (Minimal)</span>
                <span>3 (Default)</span>
                <span>5 (Heavy)</span>
                <span>8 (Master Mentor)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateCapacity}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all"
              >
                {isUpdating ? 'Saving...' : 'Save Capacity Limit'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
