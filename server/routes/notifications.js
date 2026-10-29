import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const notifs = db.collection('notifications').find({ userId: req.user.id });
  notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

router.patch('/:id/read', authenticate, (req, res) => {
  const notif = db.collection('notifications').findById(req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  const updated = db.collection('notifications').updateById(notif.id, { read: true });
  res.json(updated);
});

router.post('/read-all', authenticate, (req, res) => {
  const notifs = db.collection('notifications').find({ userId: req.user.id, read: false });
  notifs.forEach(n => {
    db.collection('notifications').updateById(n.id, { read: true });
  });
  res.json({ success: true, markedCount: notifs.length });
});

export default router;
