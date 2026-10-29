import React, { useEffect, useState } from 'react';
import { Clock, Save, CheckCircle2, User } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const MentorAvailability: React.FC = () => {
  const [days, setDays] = useState<string[]>(['Monday', 'Thursday']);
  const [hours, setHours] = useState('16:00 - 19:00 EST');
  const [format, setFormat] = useState('Online');
  const [maxMentees, setMaxMentees] = useState(3);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getMentorProfile();
        if (res.profile?.availability) {
          setDays(res.profile.availability.days || ['Monday', 'Thursday']);
          setHours(res.profile.availability.hours || '16:00 - 19:00 EST');
          setFormat(res.profile.availability.format || 'Online');
          setMaxMentees(res.profile.maxMentees || 3);
        }
      } catch (e) {}
    };
    load();
  }, []);

  const toggleDay = (d: string) => {
    if (days.includes(d)) setDays(days.filter((x) => x !== d));
    else setDays([...days, d]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAvailability({ availability: { days, hours, format }, maxMentees });
      showToast('Availability and mentee capacity updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentor Availability & Workload Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Define weekly consultation slots and maximum concurrent mentee capacity</p>
      </div>

      <div className="dark-card p-6 sm:p-8 border border-slate-800 bg-slate-900 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Available Consultation Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allDays.map((d) => {
                const isSelected = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Time Window / Office Hours</label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 16:00 - 19:00 EST"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              >
                <option value="Online">Online Video (Google Meet)</option>
                <option value="In-person">In-Person Office Hours</option>
                <option value="Either">Either Format</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Maximum Mentee Capacity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxMentees}
                onChange={(e) => setMaxMentees(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Availability Preferences
          </button>
        </form>
      </div>
    </div>
  );
};
