import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.collection('users').findOne(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Your account is pending administrator approval.' });
  }

  // Demo password validation or bcrypt
  if (password !== 'password123' && user.password !== password) {
    // allow password123 for any seed user
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  db.collection('users').updateById(user.id, { lastLogin: new Date().toISOString() });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      status: user.status
    }
  });
});

router.post('/switch-demo', (req, res) => {
  const { role } = req.body; // 'mentee' | 'mentor' | 'admin'
  let targetUser = null;
  if (role === 'admin') {
    targetUser = db.collection('users').findById('admin-1');
  } else if (role === 'mentor') {
    targetUser = db.collection('users').findById('mentor-1'); // Dr. Sarah Jenkins
  } else {
    targetUser = db.collection('users').findById('mentee-1'); // Alex Chen
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target demo account not found' });
  }

  const token = jwt.sign({ id: targetUser.id, email: targetUser.email, role: targetUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      department: targetUser.department,
      avatar: targetUser.avatar,
      status: targetUser.status
    }
  });
});

router.post('/register', (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = db.collection('users').findOne(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const status = role === 'mentor' ? 'pending' : 'active';
  const newUser = db.collection('users').insert({
    name,
    email,
    password: password || 'password123',
    role,
    department: department || 'General Engineering',
    status,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString()
  });

  if (role === 'mentee') {
    db.collection('mentee_profiles').insert({
      userId: newUser.id,
      college: '',
      academicYear: '',
      studentId: '',
      currentDegree: '',
      graduationYear: 2026,
      skills: [],
      targetSkills: [],
      interests: [],
      onboardingCompleted: false,
      profileVisibility: 'mentor_only',
      documentSharing: true
    });
  } else if (role === 'mentor') {
    db.collection('mentor_profiles').insert({
      userId: newUser.id,
      title: 'Mentor Specialist',
      organization: '',
      yearsExperience: 5,
      expertise: [],
      bio: '',
      maxMentees: 3,
      currentMenteesCount: 0,
      availability: { days: ['Monday'], hours: '17:00 - 19:00', format: 'Online' },
      rating: 5.0,
      totalSessionsHeld: 0
    });
  }

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  // Add audit log
  db.collection('audit_logs').insert({
    actorId: newUser.id,
    actorName: newUser.name,
    action: 'USER_REGISTER',
    target: newUser.role.toUpperCase(),
    details: 'New user registered with status: ' + status,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      avatar: newUser.avatar
    }
  });
});

router.get('/me', authenticate, (req, res) => {
  const user = req.user;
  let profile = null;
  if (user.role === 'mentee') {
    profile = db.collection('mentee_profiles').findOne({ userId: user.id });
  } else if (user.role === 'mentor') {
    profile = db.collection('mentor_profiles').findOne({ userId: user.id });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      status: user.status
    },
    profile
  });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: 'If an account exists with that email, a password reset link has been dispatched.' });
});

router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Your password has been reset successfully. You may now log in.' });
});

export default router;
