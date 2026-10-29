import express from 'express';
import { db } from '../db/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get current mentee profile
router.get('/profile', authenticate, requireRole('mentee'), (req, res) => {
  const profile = db.collection('mentee_profiles').findOne({ userId: req.user.id });
  res.json({ user: req.user, profile });
});

// Update mentee profile (multi-step onboarding / profile edit)
router.put('/profile', authenticate, requireRole('mentee'), (req, res) => {
  const updates = req.body;
  const userUpdates = {};
  if (updates.name) userUpdates.name = updates.name;
  if (updates.department) userUpdates.department = updates.department;
  if (updates.avatar) userUpdates.avatar = updates.avatar;

  if (Object.keys(userUpdates).length > 0) {
    db.collection('users').updateById(req.user.id, userUpdates);
  }

  let profile = db.collection('mentee_profiles').findOne({ userId: req.user.id });
  if (profile) {
    profile = db.collection('mentee_profiles').updateById(profile.id, {
      ...updates,
      userId: req.user.id,
      onboardingCompleted: true
    });
  } else {
    profile = db.collection('mentee_profiles').insert({
      ...updates,
      userId: req.user.id,
      onboardingCompleted: true
    });
  }

  // Create audit log
  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: 'UPDATE_PROFILE',
    target: 'Mentee Profile (' + req.user.name + ')',
    details: 'Mentee updated personal and academic profile.',
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.json({ success: true, profile, message: 'Profile updated successfully' });
});

// Get assigned mentor
router.get('/mentor', authenticate, requireRole('mentee'), (req, res) => {
  const assignment = db.collection('assignments').findOne({
    menteeId: req.user.id,
    status: 'active'
  });

  if (!assignment) {
    return res.json({ assigned: false, mentor: null, assignment: null });
  }

  const mentorUser = db.collection('users').findById(assignment.mentorId);
  const mentorProfile = db.collection('mentor_profiles').findOne({ userId: assignment.mentorId });

  res.json({
    assigned: true,
    assignment,
    mentor: {
      id: mentorUser.id,
      name: mentorUser.name,
      email: mentorUser.email,
      avatar: mentorUser.avatar,
      department: mentorUser.department,
      profile: mentorProfile
    }
  });
});

// Request mentor change
router.post('/change-request', authenticate, requireRole('mentee'), (req, res) => {
  const { reason, targetDomain, notes } = req.body;
  
  // Notify admin
  db.collection('notifications').insert({
    userId: 'admin-1',
    title: 'Mentor Change Requested',
    message: req.user.name + ' submitted a mentor change request: ' + (reason || 'Domain realignment'),
    category: 'system',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/admin/matching'
  });

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: 'MENTOR_CHANGE_REQUEST',
    target: req.user.name,
    details: 'Reason: ' + (reason || 'No reason provided') + '. Notes: ' + (notes || ''),
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.json({ success: true, message: 'Your mentor change request has been sent to program administrators for review.' });
});

// Get mentee progress analytics
router.get('/stats', authenticate, requireRole('mentee'), (req, res) => {
  const menteeId = req.user.id;
  const tasks = db.collection('tasks').find({ menteeId });
  const recs = db.collection('recommendations').find({ menteeId });
  const goals = db.collection('goals').find({ menteeId });
  const sessions = db.collection('sessions').find({ menteeId });
  const plans = db.collection('development_plans').find({ menteeId });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const totalRecs = recs.length;
  const completedRecs = recs.filter(r => r.status === 'completed').length;
  const inProgressRecs = recs.filter(r => r.status === 'in_progress').length;
  const acceptedRecs = recs.filter(r => r.status === 'accepted').length;

  // Calculate explainable development plan progress
  let planProgress = 0;
  if (plans.length > 0 && plans[0].milestones && plans[0].milestones.length > 0) {
    const sum = plans[0].milestones.reduce((acc, m) => acc + (m.completionPercent || 0), 0);
    planProgress = Math.round(sum / plans[0].milestones.length);
  } else if (totalTasks > 0) {
    planProgress = Math.round((completedTasks / totalTasks) * 100);
  }

  // Calculate overall program score (explainable composite)
  // 40% task completion, 30% milestone completion, 30% session attendance
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const sessionScore = sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 100;
  const compositeScore = Math.round((taskScore * 0.4) + (planProgress * 0.3) + (sessionScore * 0.3));

  res.json({
    compositeScore,
    scoreBreakdown: {
      taskCompletionRate: Math.round(taskScore),
      developmentPlanProgress: planProgress,
      sessionAttendanceRate: Math.round(sessionScore),
      explanation: 'Composite score evaluated from verified task completions (40%), roadmap milestone progress (30%), and mentoring session attendance (30%).'
    },
    taskCounts: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      pending: pendingTasks
    },
    recommendationCounts: {
      total: totalRecs,
      completed: completedRecs,
      inProgress: inProgressRecs,
      accepted: acceptedRecs
    },
    sessionsCount: {
      total: sessions.length,
      completed: completedSessions,
      upcoming: sessions.filter(s => s.status === 'scheduled').length
    },
    goalsCount: {
      total: goals.length,
      inProgress: goals.filter(g => g.status === 'in_progress').length
    }
  });
});

export default router;
