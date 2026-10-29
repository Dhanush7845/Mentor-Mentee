import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { menteeId, status, category } = req.query;
  let items = db.collection('recommendations').find();

  if (req.user.role === 'mentee') {
    items = items.filter(r => r.menteeId === req.user.id && r.status !== 'draft');
  } else if (req.user.role === 'mentor') {
    items = menteeId ? items.filter(r => r.menteeId === menteeId && r.mentorId === req.user.id) : items.filter(r => r.mentorId === req.user.id);
  } else if (menteeId) {
    items = items.filter(r => r.menteeId === menteeId);
  }

  if (status && status !== 'all') items = items.filter(r => r.status === status);
  if (category && category !== 'all') items = items.filter(r => r.category === category);

  const populated = items.map(r => {
    const mentor = db.collection('users').findById(r.mentorId);
    const mentee = db.collection('users').findById(r.menteeId);
    return {
      ...r,
      mentorName: mentor ? mentor.name : 'Mentor',
      mentorAvatar: mentor ? mentor.avatar : '',
      menteeName: mentee ? mentee.name : 'Mentee'
    };
  });

  res.json(populated);
});

router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only mentors and administrators can create recommendations' });
  }

  const {
    menteeId, title, category, description, reason, learningOutcome,
    difficulty, priority, estimatedHours, dueDate, resourceUrl, supportingDocs, relatedSkill, status
  } = req.body;

  if (!menteeId || !title || !category) {
    return res.status(400).json({ error: 'Mentee, title, and category are required' });
  }

  const newRec = db.collection('recommendations').insert({
    mentorId: req.user.id,
    menteeId,
    title,
    category,
    description: description || '',
    reason: reason || '',
    learningOutcome: learningOutcome || '',
    difficulty: difficulty || 'Intermediate',
    priority: priority || 'medium',
    estimatedHours: estimatedHours || 10,
    dueDate: dueDate || '',
    resourceUrl: resourceUrl || '',
    supportingDocs: supportingDocs || '',
    relatedSkill: relatedSkill || '',
    status: status || 'published',
    clarificationNotes: '',
    createdAt: new Date().toISOString()
  });

  if (newRec.status === 'published') {
    db.collection('notifications').insert({
      userId: menteeId,
      title: 'New Recommendation: ' + title,
      message: `${req.user.name} recommended: ${title} (${category})`,
      category: 'recommendation',
      read: false,
      createdAt: new Date().toISOString(),
      actionLink: '/mentee/recommendations'
    });
  }

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: 'CREATE_RECOMMENDATION',
    target: title,
    details: `Status: ${newRec.status}, Category: ${category}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json(newRec);
});

router.put('/:id', authenticate, (req, res) => {
  const rec = db.collection('recommendations').findById(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
  if (req.user.role === 'mentor' && rec.mentorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this recommendation' });
  }

  const updated = db.collection('recommendations').updateById(rec.id, req.body);
  res.json(updated);
});

router.patch('/:id/status', authenticate, (req, res) => {
  const { status, note } = req.body;
  const rec = db.collection('recommendations').findById(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  const updates = { status };
  if (note) updates.clarificationNotes = note;

  const updated = db.collection('recommendations').updateById(rec.id, updates);

  if (req.user.role === 'mentee') {
    db.collection('notifications').insert({
      userId: rec.mentorId,
      title: `Recommendation ${status === 'accepted' ? 'Accepted' : (status === 'declined' ? 'Declined' : 'Updated')}`,
      message: `${req.user.name} marked "${rec.title}" as ${status}`,
      category: 'recommendation',
      read: false,
      createdAt: new Date().toISOString(),
      actionLink: '/mentor/recommendations'
    });
  } else if (req.user.role === 'mentor' && status === 'published') {
    db.collection('notifications').insert({
      userId: rec.menteeId,
      title: 'Recommendation Published',
      message: `${req.user.name} published recommendation: ${rec.title}`,
      category: 'recommendation',
      read: false,
      createdAt: new Date().toISOString(),
      actionLink: '/mentee/recommendations'
    });
  }

  res.json({ success: true, recommendation: updated });
});

router.post('/:id/clarify', authenticate, (req, res) => {
  const { question } = req.body;
  const rec = db.collection('recommendations').findById(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  const updated = db.collection('recommendations').updateById(rec.id, {
    clarificationNotes: (rec.clarificationNotes ? (rec.clarificationNotes + "\n") : "") +
      `[${req.user.name}]: ${question}`
  });

  db.collection('notifications').insert({
    userId: rec.mentorId,
    title: 'Clarification Requested on Recommendation',
    message: `${req.user.name} requested clarification on "${rec.title}": ${question}`,
    category: 'recommendation',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentor/recommendations'
  });

  res.json({ success: true, recommendation: updated });
});

router.delete('/:id', authenticate, (req, res) => {
  const rec = db.collection('recommendations').findById(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'mentor' && rec.mentorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.collection('recommendations').deleteById(rec.id);
  res.json({ success: true, message: 'Recommendation removed' });
});

export default router;
