import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare, CheckCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';

export const MentorMessages: React.FC = () => {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState<any[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAssigned = async () => {
    try {
      const data = await api.getAssignedMentees();
      setAssigned(data);
      if (data.length > 0 && !selectedMentee) {
        setSelectedMentee(data[0].mentee);
      }
    } catch (e) {}
  };

  const loadMessages = async () => {
    if (!selectedMentee) return;
    try {
      const msgs = await api.getMessages(selectedMentee.id);
      setMessages(msgs);
      await api.markMessagesRead(selectedMentee.id);
    } catch (e) {}
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 6000);
    return () => clearInterval(interval);
  }, [selectedMentee]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedMentee) return;
    try {
      const newMsg = await api.sendMessage(selectedMentee.id, content.trim());
      setMessages((prev) => [...prev, newMsg]);
      setContent('');
    } catch (e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Mentee Communications</h1>
        <p className="text-xs text-slate-400 mt-0.5">Direct encrypted messaging with your assigned mentees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[550px]">
        {/* Mentee List Sidebar */}
        <div className="dark-card p-3 border border-slate-800 bg-slate-900 rounded-2xl overflow-y-auto space-y-1.5 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-2">
            Assigned Mentees
          </span>
          {assigned.map((a) => {
            const isSelected = selectedMentee?.id === a.mentee.id;
            return (
              <button
                key={a.mentee.id}
                onClick={() => setSelectedMentee(a.mentee)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <img
                  src={a.mentee.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                  alt={a.mentee.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">{a.mentee.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{a.mentee.department}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat Feed */}
        <div className="dark-card p-4 border border-slate-800 bg-slate-900 rounded-2xl flex flex-col justify-between md:col-span-3">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <MessageSquare className="w-8 h-8 mb-2" />
                No conversation history yet. Send a note to Alex!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow'
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

          <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Message ${selectedMentee?.name || 'mentee'}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
