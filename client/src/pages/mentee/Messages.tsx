import React, { useEffect, useState, useRef } from 'react';
import { Send, User, MessageSquare, Clock, CheckCheck, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [mentorData, setMentorData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const mData = await api.getAssignedMentor();
      setMentorData(mData);
      if (mData.assigned && mData.mentor) {
        const msgs = await api.getMessages(mData.mentor.id);
        setMessages(msgs);
        await api.markMessagesRead(mData.mentor.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !mentorData?.mentor) return;
    try {
      const newMsg = await api.sendMessage(mentorData.mentor.id, content.trim());
      setMessages((prev) => [...prev, newMsg]);
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const mentor = mentorData?.mentor;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="dark-card p-4 border border-slate-800 bg-slate-900 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={mentor?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
            alt={mentor?.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <h3 className="font-bold text-sm text-white">{mentor?.name || 'Assigned Mentor'}</h3>
            <p className="text-[11px] text-cyan-400 font-medium">Direct Mentorship Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online / Active</span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="dark-card p-4 sm:p-6 border border-slate-800 bg-slate-900 rounded-2xl h-[520px] flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-xs">No messages yet. Send a message to start communicating!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                    <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message to your mentor..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
