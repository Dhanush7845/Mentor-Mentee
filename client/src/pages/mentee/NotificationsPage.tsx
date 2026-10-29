import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Compass, FileCheck2, Calendar, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Notification } from '../../types';
import { Badge } from '../../components/common/Badge';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (e) {}
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.category === filter;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System updates, new recommendations, task deadlines, and session reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="recommendation">Recommendations</option>
            <option value="task">Tasks</option>
            <option value="session">Sessions</option>
            <option value="announcement">Announcements</option>
          </select>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="dark-card p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
            <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No notifications found</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.read
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200 shadow-md shadow-indigo-950/20'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  n.category === 'recommendation'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : n.category === 'task'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : n.category === 'session'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}
              >
                {n.category === 'recommendation' ? <Compass className="w-4 h-4" /> :
                 n.category === 'task' ? <FileCheck2 className="w-4 h-4" /> :
                 n.category === 'session' ? <Calendar className="w-4 h-4" /> :
                 <Sparkles className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${n.read ? 'text-slate-300' : 'text-white'}`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
