import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, GitPullRequest, Compass, Target, Award } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Detailed Multi-Step Profile Creation',
      desc: 'Mentees submit comprehensive academic background, skills, identified skill gaps, career targets, and resume.',
      icon: UserCheck
    },
    {
      step: '02',
      title: 'Transparent Matching & Assignment',
      desc: 'Administrators review explainable match scores calculated from expertise overlap, career targets, and mentor capacity.',
      icon: GitPullRequest
    },
    {
      step: '03',
      title: 'Personalized Recommendations & Roadmaps',
      desc: 'Mentors publish courses, projects, and interview preparation items with measurable milestones.',
      icon: Compass
    },
    {
      step: '04',
      title: 'Active Execution & Task Evidence',
      desc: 'Mentees accept recommendations, submit project code links, and participate in scheduled 1-on-1 video sessions.',
      icon: Target
    },
    {
      step: '05',
      title: 'Continuous Feedback & Graduation',
      desc: 'Regular progress assessments, session ratings, and verified career achievements.',
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="dark-card p-8 sm:p-12 border border-slate-800 bg-slate-900/80 rounded-2xl mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">How MentorConnect Works</h1>
        <p className="text-sm text-slate-400 mb-8">A 5-stage lifecycle designed for accountable, career-accelerating mentorship</p>

        <div className="space-y-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
