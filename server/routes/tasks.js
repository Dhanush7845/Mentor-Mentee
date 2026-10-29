import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { menteeId, status, priority } = req.query;
  let items = db.collection('tasks').find();

  if (req.user.role === 'mentee') {
    items = items.filter(t => t.menteeId === req.user.id);
  } else if (req.user.role === 'mentor') {
    if (menteeId) {
      items = items.filter(t => t.menteeId === menteeId && t.mentorId === req.user.id);
    } else {
      items = items.filter(t => t.mentorId === req.user.id);
    }
  } else if (menteeId) {
    items = items.filter(t => t.menteeId === menteeId);
  }

  if (status && status !== 'all') items = items.filter(t => t.status === status);
  if (priority && priority !== 'all') items = items.filter(t => t.priority === priority);

  res.json(items);
});

router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only mentors and admins can assign tasks' });
  }

  const { menteeId, title, description, priority, dueDate } = req.body;
  if (!menteeId || !title) {
    return res.status(400).json({ error: 'Mentee and title are required' });
  }

  const newTask = db.collection('tasks').insert({
    menteeId,
    mentorId: req.user.id,
    title,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || '',
    status: 'pending',
    evidenceUrl: '',
    submissionNotes: '',
    feedback: '',
    createdAt: new Date().toISOString()
  });

  db.collection('notifications').insert({
    userId: menteeId,
    title: 'New Task Assigned: ' + title,
    message: `${req.user.name} assigned you a new task with due date: ${dueDate || 'Flexible'}`,
    category: 'task',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentee/tasks'
  });

  res.status(201).json(newTask);
});

router.put('/:id', authenticate, (req, res) => {
  const task = db.collection('tasks').findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const updated = db.collection('tasks').updateById(task.id, req.body);
  res.json(updated);
});

// Mentee submits evidence
router.patch('/:id/submit', authenticate, (req, res) => {
  const { evidenceUrl, submissionNotes } = req.body;
  const task = db.collection('tasks').findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const updated = db.collection('tasks').updateById(task.id, {
    evidenceUrl: evidenceUrl || task.evidenceUrl,
    submissionNotes: submissionNotes || task.submissionNotes,
    status: 'completed',
    completedAt: new Date().toISOString()
  });

  db.collection('notifications').insert({
    userId: task.mentorId,
    title: 'Task Evidence Submitted',
    message: `${req.user.name} submitted work for: "${task.title}"`,
    category: 'task',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentor/tasks'
  });

  res.json({ success: true, task: updated });
});

// Mentor reviews task & provides feedback
router.patch('/:id/review', authenticate, (req, res) => {
  const { feedback, status } = req.body;
  const task = db.collection('tasks').findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const updated = db.collection('tasks').updateById(task.id, {
    feedback: feedback || task.feedback,
    status: status || 'completed'
  });

  db.collection('notifications').insert({
    userId: task.menteeId,
    title: 'Task Review & Feedback',
    message: `${req.user.name} reviewed your task "${task.title}"`,
    category: 'task',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentee/tasks'
  });

  res.json({ success: true, task: updated });
});

router.delete('/:id', authenticate, (req, res) => {
  const task = db.collection('tasks').findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  db.collection('tasks').deleteById(task.id);
  res.json({ success: true });
});

export default router;
