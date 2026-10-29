import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  User as UserIcon,
  Compass,
  FileCheck2,
  Calendar,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  Users,
  Target,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  Award,
  Layers,
  BookOpen,
  Briefcase,
  Sliders,
  ShieldCheck,
  CheckCheck,
  FileText,
  Clock,
  Activity,
  GitPullRequest
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification, Role } from '../../types';
import { Badge } from '../common/Badge';

export const AppLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleRoleSwitch = async (role: Role) => {
    setRoleMenuOpen(false);
    await switchRole(role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'mentor') navigate('/mentor/dashboard');
    else navigate('/mentee/dashboard');
  };

  // Nav item definitions based on role
  const menteeNav = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/mentee/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/mentee/profile', icon: UserIcon },
        { label: 'Edit Profile & Docs', path: '/mentee/onboarding', icon: FileText },
        { label: 'My Mentor', path: '/mentee/mentor', icon: Award },
      ],
    },
    {
      group: 'Roadmap & Progress',
      items: [
        { label: 'Recommendations', path: '/mentee/recommendations', icon: Compass },
        { label: 'Development Plan', path: '/mentee/development-plan', icon: Layers },
        { label: 'My Tasks', path: '/mentee/tasks', icon: FileCheck2 },
        { label: 'Goals & Milestones', path: '/mentee/goals', icon: Target },
        { label: 'Progress Analytics', path: '/mentee/analytics', icon: BarChart3 },
      ],
    },
    {
      group: 'Collaboration',
      items: [
        { label: 'Messages', path: '/mentee/messages', icon: MessageSquare },
        { label: 'Sessions & Calendar', path: '/mentee/sessions', icon: Calendar },
        { label: 'Progress Reports', path: '/mentee/reports', icon: Activity },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { label: 'Notifications', path: '/mentee/notifications', icon: Bell },
        { label: 'Account Settings', path: '/mentee/settings', icon: Settings },
      ],
    },
  ];

  const mentorNav = [
    {
      group: 'Overview',
      items: [
        { label: 'Mentor Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Mentees', path: '/mentor/assigned', icon: Users },
      ],
    },
    {
      group: 'Guidance & Plans',
      items: [
        { label: 'Recommendations', path: '/mentor/recommendations', icon: Compass },
        { label: 'Development Roadmap', path: '/mentor/development-plan', icon: Layers },
        { label: 'Task Management', path: '/mentor/tasks', icon: FileCheck2 },
        { label: 'Progress Assessments', path: '/mentor/assessments', icon: BarChart3 },
      ],
    },
    {
      group: 'Communication',
      items: [
        { label: 'Messages', path: '/mentor/messages', icon: MessageSquare },
        { label: 'Session Management', path: '/mentor/sessions', icon: Calendar },
        { label: 'Availability', path: '/mentor/availability', icon: Clock },
      ],
    },
    {
      group: 'Record',
      items: [
        { label: 'Mentoring Reports', path: '/mentor/reports', icon: FileText },
        { label: 'Mentor Profile', path: '/mentor/profile', icon: UserIcon },
      ],
    },
  ];

  const adminNav = [
    {
      group: 'Command Center',
      items: [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Mentor Approvals', path: '/admin/mentor-approval', icon: ShieldCheck },
      ],
    },
    {
      group: 'Matching & Programs',
      items: [
        { label: 'Mentee Matching', path: '/admin/matching', icon: GitPullRequest },
        { label: 'Workload Distribution', path: '/admin/workload', icon: BarChart3 },
        { label: 'Departments & Skills', path: '/admin/departments', icon: BookOpen },
        { label: 'Program Settings', path: '/admin/program-settings', icon: Sliders },
      ],
    },
    {
      group: 'Oversight & Analytics',
      items: [
        { label: 'Session Monitoring', path: '/admin/sessions', icon: Calendar },
        { label: 'Tasks & Recs Monitor', path: '/admin/task-monitoring', icon: Compass },
        { label: 'Reports & Export', path: '/admin/reports', icon: FileText },
        { label: 'Announcements', path: '/admin/announcements', icon: Bell },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: Activity },
      ],
    },
  ];

  const currentNav =
    user?.role === 'admin' ? adminNav : user?.role === 'mentor' ? mentorNav : menteeNav;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Mentor<span className="text-cyan-400">Connect</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                {user?.role?.toUpperCase()} PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recommendations, tasks, mentors, or topics..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Controls & Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              title="Quickly switch demo personas"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline text-slate-400">Testing as:</span>
              <span className="capitalize font-bold text-cyan-400">{user?.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Persona Switcher
                  </span>
                </div>
                <button
                  onClick={() => handleRoleSwitch('mentee')}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                    user?.role === 'mentee' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-100">Alex Chen</div>
                    <div className="text-[10px] text-slate-400">Mentee (Computer Science & AI)</div>
                  </div>
                  {user?.role === 'mentee' && <Badge variant="indigo" size="sm">Active</Badge>}
                </button>

                <button
                  onClick={() => handleRoleSwitch('mentor')}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                    user?.role === 'mentor' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-100">Dr. Sarah Jenkins</div>
                    <div className="text-[10px] text-slate-400">Mentor (Principal AI Scientist)</div>
                  </div>
                  {user?.role === 'mentor' && <Badge variant="indigo" size="sm">Active</Badge>}
                </button>

                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                    user?.role === 'admin' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-100">Program Administrator</div>
                    <div className="text-[10px] text-slate-400">Full System & Matching Control</div>
                  </div>
                  {user?.role === 'admin' && <Badge variant="indigo" size="sm">Active</Badge>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && <Badge variant="rose" size="sm">{unreadCount} new</Badge>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                            : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-200">{n.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.department}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-slate-900 border-r border-slate-800/80 p-4 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto`}
        >
          <nav className="space-y-6">
            {currentNav.map((group) => (
              <div key={group.group}>
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};



