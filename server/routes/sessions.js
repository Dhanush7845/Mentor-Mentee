import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  let items = db.collection('sessions').find();
  if (req.user.role === 'mentee') {
    items = items.filter(s => s.menteeId === req.user.id);
  } else if (req.user.role === 'mentor') {
    items = items.filter(s => s.mentorId === req.user.id);
  }

  const populated = items.map(s => {
    const mentor = db.collection('users').findById(s.mentorId);
    const mentee = db.collection('users').findById(s.menteeId);
    return {
      ...s,
      mentorName: mentor ? mentor.name : 'Mentor',
      mentorAvatar: mentor ? mentor.avatar : '',
      menteeName: mentee ? mentee.name : 'Mentee',
      menteeAvatar: mentee ? mentee.avatar : ''
    };
  });

  res.json(populated);
});

router.post('/', authenticate, (req, res) => {
  const { menteeId, mentorId, title, date, time, durationMinutes, meetingLink, agenda } = req.body;
  const effectiveMentorId = req.user.role === 'mentor' ? req.user.id : mentorId;
  const effectiveMenteeId = req.user.role === 'mentee' ? req.user.id : menteeId;

  if (!effectiveMentorId || !effectiveMenteeId || !title || !date) {
    return res.status(400).json({ error: 'Missing required session parameters' });
  }

  const newSession = db.collection('sessions').insert({
    mentorId: effectiveMentorId,
    menteeId: effectiveMenteeId,
    title,
    date,
    time: time || '16:00 - 17:00 EST',
    durationMinutes: durationMinutes || 60,
    meetingLink: meetingLink || 'https://meet.google.com/mentor-connect-room',
    agenda: agenda || '',
    status: 'scheduled',
    mentorNotes: '',
    actionItems: [],
    menteeFeedback: '',
    rating: null,
    createdAt: new Date().toISOString()
  });

  const recipientId = req.user.role === 'mentor' ? effectiveMenteeId : effectiveMentorId;
  db.collection('notifications').insert({
    userId: recipientId,
    title: 'New Mentoring Session Scheduled',
    message: `${req.user.name} scheduled "${title}" on ${date} at ${time}`,
    category: 'session',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: req.user.role === 'mentor' ? '/mentee/sessions' : '/mentor/sessions'
  });

  res.status(201).json(newSession);
});

router.put('/:id', authenticate, (req, res) => {
  const session = db.collection('sessions').findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const updated = db.collection('sessions').updateById(session.id, req.body);
  res.json(updated);
});

router.patch('/:id/feedback', authenticate, (req, res) => {
  const { feedback, rating } = req.body;
  const session = db.collection('sessions').findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const updated = db.collection('sessions').updateById(session.id, {
    menteeFeedback: feedback,
    rating: Number(rating) || 5
  });

  res.json({ success: true, session: updated });
});

router.patch('/:id/notes', authenticate, (req, res) => {
  const { mentorNotes, actionItems, status } = req.body;
  const session = db.collection('sessions').findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const updates = {};
  if (mentorNotes !== undefined) updates.mentorNotes = mentorNotes;
  if (actionItems !== undefined) updates.actionItems = actionItems;
  if (status) updates.status = status;

  const updated = db.collection('sessions').updateById(session.id, updates);
  res.json({ success: true, session: updated });
});

router.delete('/:id', authenticate, (req, res) => {
  db.collection('sessions').deleteById(req.params.id);
  res.json({ success: true });
});

export default router;
