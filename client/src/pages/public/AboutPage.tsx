import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ShieldCheck, Award, ArrowLeft } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="dark-card p-8 sm:p-12 border border-slate-800 bg-slate-900/80 rounded-2xl">
        <h1 className="text-3xl font-extrabold text-white mb-4">About MentorConnect</h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          MentorConnect was conceived to bridge the gap between academic theory and real-world industrial mastery. Designed for modern higher education and career development networks, the platform combines systematic transparent matching, personalized roadmap curation, and accountable progress tracking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Core Values
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Explainable matching over opaque algorithms</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Milestone-based learning roadmaps</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Safe, private mentor notes & communication</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Administrative Governance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Program coordinators have centralized tools to audit relationships, avoid mentor burnout through workload balancing, and export program effectiveness data for accreditation.
            </p>
          </div>
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
        >
          Join MentorConnect Today
        </Link>
      </div>
    </div>
  );
};
