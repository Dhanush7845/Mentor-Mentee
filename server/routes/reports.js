import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  let reports = db.collection('progress_reports').find();
  if (req.user.role === 'mentee') {
    reports = reports.filter(r => r.menteeId === req.user.id);
  }
  res.json(reports);
});

router.post('/', authenticate, (req, res) => {
  const { period, summary, achievements, challenges, evidenceLinks } = req.body;
  const menteeId = req.user.id;

  const newReport = db.collection('progress_reports').insert({
    menteeId,
    period: period || 'Bi-Weekly Update',
    summary,
    achievements: achievements || '',
    challenges: challenges || '',
    evidenceLinks: evidenceLinks || '',
    mentorFeedback: '',
    submittedAt: new Date().toISOString()
  });

  const assignment = db.collection('assignments').findOne({ menteeId, status: 'active' });
  if (assignment) {
    db.collection('notifications').insert({
      userId: assignment.mentorId,
      title: 'New Progress Report Submitted',
      message: `${req.user.name} submitted a progress report for ${newReport.period}`,
      category: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      actionLink: '/mentor/progress'
    });
  }

  res.status(201).json(newReport);
});

export default router;
