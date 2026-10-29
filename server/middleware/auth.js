import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'mentor-connect-secret-key-2026';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Handle demo token bypass or standard JWT
  if (token.startsWith('demo-user-')) {
    const userId = token.replace('demo-user-', '');
    const user = db.collection('users').findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid demo session' });
    }
    req.user = user;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.collection('users').findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions for this operation' });
    }
    next();
  };
};

export const requireAssignedMentee = (req, res, next) => {
  const menteeId = req.params.menteeId || req.body.menteeId || req.query.menteeId;
  if (!menteeId) {
    return next();
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'mentee') {
    if (req.user.id !== menteeId) {
      return res.status(403).json({ error: 'Access denied: mentees cannot view other mentees private profiles' });
    }
    return next();
  }

  if (req.user.role === 'mentor') {
    const assignment = db.collection('assignments').findOne({
      mentorId: req.user.id,
      menteeId: menteeId,
      status: 'active'
    });
    if (!assignment) {
      return res.status(403).json({ error: 'Access denied: this mentee is not assigned to you' });
    }
    return next();
  }

  return res.status(403).json({ error: 'Access forbidden' });
};
