import React, { useEffect, useState } from 'react';
import { 
  Bell, Send, Plus, Users, ShieldAlert, 
  Megaphone, CheckCircle2, Clock, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AnnouncementsManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAnnouncements();
      setAnnouncements(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    try {
      setIsSubmitting(true);
      await api.createAnnouncement(formData);
      showToast('Announcement broadcasted to all selected recipients!', 'success');
      setShowComposeModal(false);
      setFormData({ title: '', content: '', targetAudience: 'all', priority: 'medium' });
      loadAnnouncements();
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="dark-card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
            <Megaphone className="w-3.5 h-3.5" /> Platform Communications
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Announcements & Broadcast Management
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Publish announcements to mentees, mentors, or all platform users. All broadcasts trigger in-platform notification alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" /> Compose Announcement
          </button>
          <button
            onClick={loadAnnouncements}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No announcements published yet.</p>
            <button
              onClick={() => setShowComposeModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium"
            >
              Create First Announcement
            </button>
          </div>
        )}
        {announcements.map((a: any) => (
          <div key={a.id} className="dark-card bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  a.priority === 'high' ? 'bg-rose-500/15 text-rose-400' :
                  a.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-bold text-white">{a.title}</h3>
                    <Badge variant={a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'neutral'}>
                      {a.priority} priority
                    </Badge>
                    <Badge variant={a.targetAudience === 'all' ? 'info' : 'neutral'}>
                      To: {a.targetAudience === 'all' ? 'Everyone' : a.targetAudience}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{a.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : 'Just now'}
                    </span>
                    <span>by {a.authorName || 'Admin'}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowComposeModal(false)}
          title="Compose Platform Announcement"
        >
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Announcement Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Fall 2026 Cohort Kickoff ? Important Dates"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Message Body *
              </label>
              <textarea
                rows={5}
                placeholder="Write your announcement message here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Users</option>
                  <option value="mentees">Mentees Only</option>
                  <option value="mentors">Mentors Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High ? Urgent Alert</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              This announcement will be immediately broadcast to all selected recipients via in-platform notification alerts.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
