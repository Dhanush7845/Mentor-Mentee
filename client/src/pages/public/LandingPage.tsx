import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Target, Users, BookOpen, Layers, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'mentee' | 'mentor' | 'admin') => {
    await switchRole(role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'mentor') navigate('/mentor/dashboard');
    else navigate('/mentee/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Public Navbar */}
      <nav className="h-20 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Mentor<span className="text-cyan-400">Connect</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/about" className="hover:text-cyan-400 transition-colors">About Program</Link>
          <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link>
          <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 lg:py-28 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Next-Gen Academic & Professional Mentorship
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-none mb-6">
          Empowering Mentees, Guiding Careers with <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Precision & Purpose</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Centralized mentorship management platform featuring explainable matching, interactive personalized development roadmaps, real-time progress tracking, and complete administrative control.
        </p>

        {/* 1-Click Instant Demo Evaluation Bar */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md mb-12 max-w-2xl w-full">
          <p className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
            Explore with 1-Click Interactive Demo Personas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickDemo('mentee')}
              className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 text-xs font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-cyan-400" /> Mentee Portal (Alex)
            </button>
            <button
              onClick={() => handleQuickDemo('mentor')}
              className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 text-xs font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" /> Mentor Portal (Dr. Sarah)
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 text-xs font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Command Center
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
          <div className="dark-card p-6 dark-card-hover">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Transparent Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Domain synergy, skill overlap, career target, and workload availability scoring. No black-box decisions.
            </p>
          </div>

          <div className="dark-card p-6 dark-card-hover">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Actionable Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curate structured development plans linking courses, projects, certifications, and tasks with clear milestones.
            </p>
          </div>

          <div className="dark-card p-6 dark-card-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Strict Privacy Controls</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mentors only see assigned mentees. Confidential mentoring notes are strictly hidden from students.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 MentorConnect. All rights reserved. Built with modern React, Express, and high-performance dark theme architecture.</p>
      </footer>
    </div>
  );
};
