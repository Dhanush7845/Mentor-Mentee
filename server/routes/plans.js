import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:menteeId', authenticate, (req, res) => {
  const menteeId = req.params.menteeId === 'me' ? req.user.id : req.params.menteeId;
  const plan = db.collection('development_plans').findOne({ menteeId });
  res.json(plan || { menteeId, milestones: [], title: 'Development Roadmap' });
});

router.post('/', authenticate, (req, res) => {
  const { menteeId, title, overview, milestones } = req.body;
  if (!menteeId) return res.status(400).json({ error: 'menteeId is required' });

  let plan = db.collection('development_plans').findOne({ menteeId });
  if (plan) {
    plan = db.collection('development_plans').updateById(plan.id, {
      title: title || plan.title,
      overview: overview || plan.overview,
      milestones: milestones || plan.milestones,
      mentorId: req.user.id
    });
  } else {
    plan = db.collection('development_plans').insert({
      menteeId,
      mentorId: req.user.id,
      title: title || 'Curriculum Roadmap',
      overview: overview || '',
      milestones: milestones || []
    });
  }

  res.json({ success: true, plan });
});

export default router;
