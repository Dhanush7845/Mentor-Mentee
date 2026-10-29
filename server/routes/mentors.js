import express from 'express';
import { db } from '../db/store.js';
import { authenticate, requireRole, requireAssignedMentee } from '../middleware/auth.js';

const router = express.Router();

// List assigned mentees for logged in mentor
router.get('/assigned', authenticate, requireRole('mentor'), (req, res) => {
  const assignments = db.collection('assignments').find({
    mentorId: req.user.id,
    status: 'active'
  });

  const menteeList = assignments.map(a => {
    const menteeUser = db.collection('users').findById(a.menteeId);
    const menteeProfile = db.collection('mentee_profiles').findOne({ userId: a.menteeId });
    const tasks = db.collection('tasks').find({ menteeId: a.menteeId });
    const recs = db.collection('recommendations').find({ menteeId: a.menteeId });
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
      assignmentId: a.id,
      matchScore: a.matchScore,
      matchReasons: a.matchReasons,
      assignedAt: a.assignedAt,
      mentee: {
        id: menteeUser ? menteeUser.id : a.menteeId,
        name: menteeUser ? menteeUser.name : 'Unknown Mentee',
        email: menteeUser ? menteeUser.email : '',
        avatar: menteeUser ? menteeUser.avatar : '',
        department: menteeUser ? menteeUser.department : '',
        academicYear: menteeProfile ? menteeProfile.academicYear : '',
        currentDegree: menteeProfile ? menteeProfile.currentDegree : '',
        targetRole: menteeProfile ? menteeProfile.targetRole : '',
        skills: menteeProfile ? menteeProfile.skills : [],
        targetSkills: menteeProfile ? menteeProfile.targetSkills : []
      },
      stats: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
        overdueTasks: tasks.filter(t => t.status === 'overdue').length,
        progressPercent,
        totalRecs: recs.length
      }
    };
  });

  res.json(menteeList);
});

// View specific mentee profile details (Protected: only assigned mentor or admin)
router.get('/mentee/:menteeId', authenticate, requireRole('mentor', 'admin'), requireAssignedMentee, (req, res) => {
  const menteeId = req.params.menteeId;
  const user = db.collection('users').findById(menteeId);
  if (!user) {
    return res.status(404).json({ error: 'Mentee not found' });
  }

  const profile = db.collection('mentee_profiles').findOne({ userId: menteeId });
  const tasks = db.collection('tasks').find({ menteeId });
  const recs = db.collection('recommendations').find({ menteeId });
  const goals = db.collection('goals').find({ menteeId });
  const plan = db.collection('development_plans').findOne({ menteeId });
  const notes = db.collection('mentor_notes').find({ menteeId, mentorId: req.user.id });

  // Calculate identified skill gaps
  const currentSkills = (profile && profile.skills) || [];
  const targetSkills = (profile && profile.targetSkills) || [];
  const skillGaps = targetSkills.filter(s => !currentSkills.includes(s));

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      department: user.department
    },
    profile,
    skillGaps,
    tasks,
    recommendations: recs,
    goals,
    developmentPlan: plan,
    privateNotes: notes
  });
});

// Get private mentor notes for a mentee
router.get('/notes/:menteeId', authenticate, requireRole('mentor', 'admin'), requireAssignedMentee, (req, res) => {
  const notes = db.collection('mentor_notes').find({
    menteeId: req.params.menteeId,
    mentorId: req.user.id
  });
  res.json(notes);
});

// Add a private mentor note
router.post('/notes', authenticate, requireRole('mentor'), (req, res) => {
  const { menteeId, note } = req.body;
  if (!menteeId || !note) {
    return res.status(400).json({ error: 'Mentee ID and note content are required' });
  }

  // Ensure mentee is assigned
  const assignment = db.collection('assignments').findOne({
    mentorId: req.user.id,
    menteeId,
    status: 'active'
  });
  if (!assignment) {
    return res.status(403).json({ error: 'Cannot add notes for unassigned mentee' });
  }

  const newNote = db.collection('mentor_notes').insert({
    mentorId: req.user.id,
    menteeId,
    note,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newNote);
});

// Get / update mentor profile
router.get('/profile', authenticate, requireRole('mentor'), (req, res) => {
  const profile = db.collection('mentor_profiles').findOne({ userId: req.user.id });
  res.json({ user: req.user, profile });
});

router.put('/profile', authenticate, requireRole('mentor'), (req, res) => {
  const updates = req.body;
  const userUpdates = {};
  if (updates.name) userUpdates.name = updates.name;
  if (updates.department) userUpdates.department = updates.department;
  if (updates.avatar) userUpdates.avatar = updates.avatar;

  if (Object.keys(userUpdates).length > 0) {
    db.collection('users').updateById(req.user.id, userUpdates);
  }

  let profile = db.collection('mentor_profiles').findOne({ userId: req.user.id });
  if (profile) {
    profile = db.collection('mentor_profiles').updateById(profile.id, updates);
  } else {
    profile = db.collection('mentor_profiles').insert({ ...updates, userId: req.user.id });
  }

  res.json({ success: true, profile, message: 'Mentor profile updated successfully' });
});

// Update mentor availability
router.put('/availability', authenticate, requireRole('mentor'), (req, res) => {
  const { availability, maxMentees } = req.body;
  let profile = db.collection('mentor_profiles').findOne({ userId: req.user.id });
  if (profile) {
    profile = db.collection('mentor_profiles').updateById(profile.id, {
      availability: availability || profile.availability,
      maxMentees: maxMentees !== undefined ? maxMentees : profile.maxMentees
    });
  }
  res.json({ success: true, availability: profile.availability, maxMentees: profile.maxMentees });
});

// Mentor reports and history
router.get('/reports', authenticate, requireRole('mentor'), (req, res) => {
  const mentorId = req.user.id;
  const assignments = db.collection('assignments').find({ mentorId });
  const sessions = db.collection('sessions').find({ mentorId });
  const tasks = db.collection('tasks').find({ mentorId });
  const recs = db.collection('recommendations').find({ mentorId });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalHours = completedSessions * 1.0; // average 1 hr per session

  res.json({
    activeMenteesCount: assignments.filter(a => a.status === 'active').length,
    totalMenteesGraduated: assignments.filter(a => a.status === 'completed').length,
    totalSessions,
    completedSessions,
    totalHoursMentored: totalHours,
    recommendationsPublished: recs.filter(r => r.status !== 'draft').length,
    tasksEvaluated: tasks.filter(t => t.status === 'completed').length
  });
});

export default router;
