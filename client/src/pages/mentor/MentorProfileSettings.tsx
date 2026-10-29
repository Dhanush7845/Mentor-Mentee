import React, { useEffect, useState } from 'react';
import { User, Award, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const MentorProfileSettings: React.FC = () => {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [yearsExperience, setYearsExperience] = useState(12);
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('Machine Learning, PyTorch, Deep Learning, System Design');
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getMentorProfile();
        if (res.profile) {
          setTitle(res.profile.title || '');
          setOrganization(res.profile.organization || '');
          setYearsExperience(res.profile.yearsExperience || 10);
          setBio(res.profile.bio || '');
          setExpertise((res.profile.expertise || []).join(', '));
        }
      } catch (e) {}
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateMentorProfile({
        title,
        organization,
        yearsExperience: Number(yearsExperience),
        bio,
        expertise: expertise.split(',').map((x) => x.trim()).filter(Boolean)
      });
      showToast('Mentor profile saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Professional Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Keep your credentials and specialized domains updated for matching</p>
      </div>

      <div className="dark-card p-6 sm:p-8 border border-slate-800 bg-slate-900 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Professional Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Affiliation / Organization</label>
            <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Years of Professional Experience</label>
            <input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Specialized Expertise (comma separated)</label>
            <input type="text" value={expertise} onChange={(e) => setExpertise(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Biographical Statement</label>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};
