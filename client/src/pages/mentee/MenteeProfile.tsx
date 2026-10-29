import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  FileText,
  Edit,
  ExternalLink,
  Code, Share2,
  Globe,
  Mail,
  Phone,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';

export const MenteeProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getMenteeProfile();
        setProfile(res.profile);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.name}</h1>
              <Badge variant="cyan" size="sm">Mentee</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {profile?.currentDegree || 'Computer Science'} â€¢ {profile?.college || 'School of Engineering'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-cyan-400" /> {user?.email}</span>
              {profile?.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-cyan-400" /> {profile.phone}</span>}
              <span className="text-slate-500">ID: {profile?.studentId || 'STU-2026-9041'}</span>
            </div>
          </div>
        </div>

        <Link
          to="/mentee/onboarding"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
        >
          <Edit className="w-4 h-4" /> Edit Profile & Documents
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Education & Links */}
        <div className="space-y-6 md:col-span-1">
          {/* Academic Background */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> Academic Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Degree / Major</span>
                <span className="text-slate-200 font-medium">{profile?.currentDegree || 'B.S. in Computer Science'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Institution</span>
                <span className="text-slate-200 font-medium">{profile?.college || 'University Engineering'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Academic Year</span>
                  <span className="text-slate-200 font-medium">{profile?.academicYear || 'Senior (Final Year)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Graduation</span>
                  <span className="text-slate-200 font-medium">{profile?.graduationYear || 2026}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Profiles & Links */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Verified Links
            </h3>
            <div className="space-y-2 text-xs">
              {profile?.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2"><Code className="w-4 h-4 text-slate-200" /> GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2"><Share2 className="w-4 h-4 text-blue-400" /> LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>
          </div>

          {/* Resume Preview Box */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Attached Resume
            </h3>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-slate-200">{profile?.resumeName || 'Alex_Chen_Resume.pdf'}</p>
                <span className="text-[10px] text-slate-500">Verified Document</span>
              </div>
              <Badge variant="emerald" size="sm">Uploaded</Badge>
            </div>
          </div>
        </div>

        {/* Right Columns: Skills, Goals, Experience */}
        <div className="space-y-6 md:col-span-2">
          {/* Target Role & Career Objectives */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Target Role & Career Goals
            </h3>
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 mb-4">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">Aspirational Target Role:</span>
              <div className="text-base font-bold text-white mt-0.5">{profile?.targetRole || 'Machine Learning Engineer'}</div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Short-Term Objective:</span>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {profile?.shortTermGoals || 'Complete benchmarking study and prepare for technical interviews.'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Long-Term Vision:</span>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {profile?.longTermGoals || 'Become a Principal ML Scientist and contribute open source foundational models.'}
                </p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Skills & Development Areas
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-2">Verified Current Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.skills?.map((s: string) => (
                    <Badge key={s} variant="indigo" size="md">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-2">Target Skills to Develop:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.targetSkills?.map((s: string) => (
                    <Badge key={s} variant="cyan" size="md">{s}</Badge>
                  ))}
                </div>
              </div>

              {profile?.interests && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-2">Personal Interests:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.interests?.map((i: string) => (
                      <Badge key={i} variant="slate" size="md">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects & Internships */}
          <div className="dark-card p-6 border border-slate-800 bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" /> Experience & Achievements
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Previous Internships:</span>
                <p className="text-slate-200 mt-0.5">{profile?.previousInternships || 'Machine Learning Research Intern at FAIR'}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Academic Projects:</span>
                <p className="text-slate-200 mt-0.5">{profile?.academicProjects || 'Lightweight KV-cache compression library'}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Key Achievements:</span>
                <p className="text-slate-200 mt-0.5">{profile?.achievements || 'Published workshop paper at NeurIPS 2025'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

