import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, GraduationCap, Award, Target, FileText, CheckCircle2,
  ChevronRight, ChevronLeft, Save, Upload, Plus, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const MenteeOnboarding: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [targetSkillInput, setTargetSkillInput] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    department: user?.department || 'Computer Science & AI',
    college: 'Stanford School of Engineering',
    academicYear: 'Final Year (Senior)',
    studentId: 'CS-2026-9041',
    currentDegree: 'B.S. in Computer Science',
    graduationYear: 2026,
    previousInternships: 'Machine Learning Research Intern at FAIR (Summer 2025)',
    academicProjects: 'Developed lightweight KV-cache compression library',
    achievements: 'Winner of Stanford AI Hackathon 2025',
    resumeName: 'Alex_Chen_ML_Resume_2026.pdf',
    skills: ['Python', 'PyTorch', 'C++', 'Git', 'Linux'],
    targetSkills: ['Distributed Training', 'Kernel Optimization', 'System Design'],
    learningStyle: 'Hands-on project based',
    languages: 'English, Mandarin',
    shortTermGoals: 'Complete benchmarking study on reasoning models and submit arXiv pre-print',
    longTermGoals: 'Become a Senior ML Research Scientist and contribute foundational models',
    targetRole: 'Machine Learning Research Engineer / Applied Scientist',
    preferredFrequency: 'Bi-weekly',
    meetingFormat: 'Online',
    expectations: 'Rigorous technical reviews, architectural critique on projects',
    portfolioUrl: 'https://alexchen.dev',
    githubUrl: 'https://github.com/alexchen-ml',
    linkedinUrl: 'https://linkedin.com/in/alexchen-ai'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getMenteeProfile();
        if (res.profile) setFormData((prev) => ({ ...prev, ...res.profile }));
      } catch (e) {}
    };
    load();
  }, []);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => setFormData({ ...formData, skills: formData.skills.filter((x) => x !== s) });

  const addTarget = () => {
    if (targetSkillInput.trim() && !formData.targetSkills.includes(targetSkillInput.trim())) {
      setFormData({ ...formData, targetSkills: [...formData.targetSkills, targetSkillInput.trim()] });
      setTargetSkillInput('');
    }
  };

  const removeTarget = (s: string) => setFormData({ ...formData, targetSkills: formData.targetSkills.filter((x) => x !== s) });

  const handleSave = async (isFinal = false) => {
    setLoading(true);
    try {
      await api.updateMenteeProfile({ ...formData, onboardingCompleted: isFinal });
      showToast(isFinal ? 'Profile successfully saved!' : 'Draft saved!', 'success');
      if (isFinal) navigate('/mentee/profile');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Education & Docs', icon: GraduationCap },
    { num: 3, title: 'Skills & Growth', icon: Award },
    { num: 4, title: 'Goals & Format', icon: Target },
    { num: 5, title: 'Links & Review', icon: FileText }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentee Profile & Onboarding</h1>
          <p className="text-xs text-slate-400 mt-0.5">Step {currentStep} of 5: Complete your academic and career roadmap info</p>
        </div>
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save Draft
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num)}
            className={`flex items-center justify-center sm:justify-start gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
              currentStep === s.num
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : currentStep > s.num ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === s.num ? 'bg-white text-indigo-600' : currentStep > s.num ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {currentStep > s.num ? '✓' : s.num}
            </div>
            <span className="hidden sm:inline truncate">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="dark-card p-6 sm:p-8 border border-slate-800 bg-slate-900">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Step 1: Personal & Institutional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 382-9912" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">College / Organization</label>
                <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Academic Year</label>
                <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student ID</label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Step 2: Education, Experience & Resume Upload</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Degree</label>
                <input type="text" name="currentDegree" value={formData.currentDegree} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graduation Year</label>
                <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Previous Internships</label>
                <textarea rows={2} name="previousInternships" value={formData.previousInternships} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Academic Projects</label>
                <textarea rows={2} name="academicProjects" value={formData.academicProjects} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div className="sm:col-span-2 p-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 text-center">
                <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-200 block mb-1">Uploaded Resume</span>
                <span className="text-xs text-emerald-400 font-mono">{formData.resumeName} (Verified)</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Step 3: Skills & Development Goals</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Skills</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="button" onClick={addSkill} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {formData.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    {s} <button type="button" onClick={() => removeSkill(s)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Skills to Master</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={targetSkillInput} onChange={(e) => setTargetSkillInput(e.target.value)} placeholder="Add target skill..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="button" onClick={addTarget} className="px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {formData.targetSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    {s} <button type="button" onClick={() => removeTarget(s)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Step 4: Goals, Meeting Frequency & Expectations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Target Role</label>
                <input type="text" name="targetRole" value={formData.targetRole} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Short-Term Goals</label>
                <textarea rows={2} name="shortTermGoals" value={formData.shortTermGoals} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Long-Term Goals</label>
                <textarea rows={2} name="longTermGoals" value={formData.longTermGoals} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Step 5: Professional Links & Final Review</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Portfolio URL</label>
                <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GitHub URL</label>
                <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-2">Review Summary:</span>
              <p>• {formData.name} ({formData.department})</p>
              <p>• Target: {formData.targetRole || 'Not specified'}</p>
              <p>• Skills: {formData.skills.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
            >
              Previous
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {loading ? 'Submitting...' : 'Save & Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
