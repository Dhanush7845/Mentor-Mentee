import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const menteeId = req.query.menteeId || req.user.id;
  const goals = db.collection('goals').find({ menteeId });
  res.json(goals);
});

router.post('/', authenticate, (req, res) => {
  const { title, type, targetDate, notes } = req.body;
  const menteeId = req.body.menteeId || req.user.id;
  if (!title) return res.status(400).json({ error: 'Goal title required' });

  const newGoal = db.collection('goals').insert({
    menteeId,
    title,
    type: type || 'short_term',
    targetDate: targetDate || '',
    status: 'in_progress',
    progressPercent: 0,
    notes: notes || ''
  });

  res.status(201).json(newGoal);
});

router.put('/:id', authenticate, (req, res) => {
  const goal = db.collection('goals').findById(req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  const updated = db.collection('goals').updateById(goal.id, req.body);
  res.json(updated);
});

router.delete('/:id', authenticate, (req, res) => {
  db.collection('goals').deleteById(req.params.id);
  res.json({ success: true });
});

export default router;
