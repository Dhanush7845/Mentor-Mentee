import React, { useEffect, useState } from 'react';
import { 
  FolderTree, Plus, Tags, Building2, 
  RefreshCw, Hash
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const DepartmentsCategories: React.FC = () => {
  const [data, setData] = useState<{ departments: any[]; skills: any[] }>({ departments: [], skills: [] });
  const [loading, setLoading] = useState(true);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newSkillTag, setNewSkillTag] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([
    'React', 'TypeScript', 'Node.js', 'System Architecture', 'Product Design', 
    'Figma', 'Data Science', 'Machine Learning', 'Cyber Security', 'Agile Leadership',
    'Career Transition', 'Public Speaking', 'Executive Presence'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load taxonomy data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      setIsSubmitting(true);
      await api.createDepartment(newDeptName.trim());
      showToast(`Department "${newDeptName.trim()}" created successfully`, 'success');
      setNewDeptName('');
      setShowAddDeptModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillTag.trim()) return;
    if (skillsList.includes(newSkillTag.trim())) {
      showToast('Skill tag already exists in catalog', 'warning');
      return;
    }
    setSkillsList([...skillsList, newSkillTag.trim()]);
    showToast(`Skill "${newSkillTag.trim()}" added to catalog`, 'success');
    setNewSkillTag('');
  };

  const depts = data.departments?.length > 0 ? data.departments : [
    { id: '1', name: 'Engineering', count: 14 },
    { id: '2', name: 'Product Design', count: 8 },
    { id: '3', name: 'Data Science', count: 6 },
    { id: '4', name: 'Cyber Security', count: 4 },
    { id: '5', name: 'Product Management', count: 5 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-3">
            <FolderTree className="w-3.5 h-3.5" /> Taxonomy & Classification
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Departments & Skills Taxonomy
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Manage organizational divisions, academic departments, and skills tagging used by the algorithmic matching engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Departments List */}
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              Active Departments ({depts.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {depts.map((d: any) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{d.name}</h3>
                    <p className="text-xs text-slate-500">Active participating division</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                    {d.count || 5} members
                  </span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Skills Taxonomy Catalog */}
        <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-indigo-400" />
              Skills Taxonomy ({skillsList.length} tags)
            </h2>
          </div>

          {/* Add Skill Tag Input */}
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter new skill name (e.g. GraphQL, Kubernetes)..."
                value={newSkillTag}
                onChange={(e) => setNewSkillTag(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Add Tag
            </button>
          </form>

          {/* Skill Tags Cloud */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap gap-2">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-default"
              >
                <Hash className="w-3 h-3 text-indigo-400" />
                {skill}
              </span>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
            <strong>Matching Tip:</strong> Skills tagged here are automatically suggested during mentee onboarding and mentor profile setup. Exact matches receive 40 points in the compatibility scoring algorithm.
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddDeptModal(false)}
          title="Create New Department"
        >
          <form onSubmit={handleCreateDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Department Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Information Security, Legal & Compliance"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddDeptModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all"
              >
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
