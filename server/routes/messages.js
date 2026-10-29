import express from 'express';
import { db } from '../db/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:otherUserId', authenticate, (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.otherUserId;

  const messages = db.collection('messages').find(m => {
    return (m.senderId === currentUserId && m.receiverId === otherUserId) ||
           (m.senderId === otherUserId && m.receiverId === currentUserId);
  });

  messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  res.json(messages);
});

router.post('/', authenticate, (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver and content are required' });
  }

  const newMsg = db.collection('messages').insert({
    senderId: req.user.id,
    receiverId,
    content,
    sentAt: new Date().toISOString(),
    readAt: null
  });

  db.collection('notifications').insert({
    userId: receiverId,
    title: 'New Message from ' + req.user.name,
    message: content.length > 60 ? content.substring(0, 60) + '...' : content,
    category: 'system',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: req.user.role === 'mentee' ? '/mentor/messages' : '/mentee/messages'
  });

  res.status(201).json(newMsg);
});

router.patch('/read/:otherUserId', authenticate, (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.otherUserId;

  const msgs = db.collection('messages').find(m => m.senderId === otherUserId && m.receiverId === currentUserId && !m.readAt);
  msgs.forEach(m => {
    db.collection('messages').updateById(m.id, { readAt: new Date().toISOString() });
  });

  res.json({ success: true, count: msgs.length });
});

export default router;
