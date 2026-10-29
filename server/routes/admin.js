import express from 'express';
import { db } from '../db/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

// Platform-wide Overview KPI Metrics
router.get('/overview', (req, res) => {
  const users = db.collection('users').find();
  const mentees = users.filter(u => u.role === 'mentee');
  const mentors = users.filter(u => u.role === 'mentor');
  const activeAssignments = db.collection('assignments').find({ status: 'active' });
  const pendingApprovals = mentors.filter(m => m.status === 'pending');
  const sessions = db.collection('sessions').find();
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const tasks = db.collection('tasks').find();
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const recs = db.collection('recommendations').find();
  const pendingRecs = recs.filter(r => r.status === 'published' || r.status === 'in_progress');
  const plans = db.collection('development_plans').find();

  // Find unassigned mentees
  const assignedMenteeIds = new Set(activeAssignments.map(a => a.menteeId));
  const unassignedMentees = mentees.filter(m => !assignedMenteeIds.has(m.id) && m.status === 'active');

  // Overall program participation
  const participationRate = mentees.length > 0 ? Math.round((activeAssignments.length / mentees.length) * 100) : 0;

  // Department distribution
  const deptMap = {};
  mentees.forEach(m => {
    const d = m.department || 'Other';
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const departmentDistribution = Object.keys(deptMap).map(k => ({ name: k, count: deptMap[k] }));

  // Mentee progress distribution
  let highProgress = 0, midProgress = 0, lowProgress = 0;
  mentees.forEach(m => {
    const mTasks = tasks.filter(t => t.menteeId === m.id);
    if (mTasks.length === 0) {
      lowProgress++;
    } else {
      const comp = mTasks.filter(t => t.status === 'completed').length / mTasks.length;
      if (comp >= 0.7) highProgress++;
      else if (comp >= 0.3) midProgress++;
      else lowProgress++;
    }
  });

  res.json({
    kpis: {
      totalMentees: mentees.length,
      totalMentors: mentors.length,
      activeRelationships: activeAssignments.length,
      unassignedMenteesCount: unassignedMentees.length,
      upcomingSessionsCount: upcomingSessions.length,
      pendingMentorApprovalsCount: pendingApprovals.length,
      recommendationsAwaitingAction: pendingRecs.length,
      completedPlansCount: plans.filter(p => p.milestones && p.milestones.every(m => m.completionPercent === 100)).length,
      overdueTasksCount: overdueTasks.length,
      programParticipationRate: participationRate
    },
    departmentDistribution,
    progressDistribution: [
      { name: 'High Progress (70%+)', count: highProgress, fill: '#10b981' },
      { name: 'On Track (30-69%)', count: midProgress, fill: '#3b82f6' },
      { name: 'Needs Attention (<30%)', count: lowProgress, fill: '#f59e0b' }
    ]
  });
});

// User Management list
router.get('/users', (req, res) => {
  const { role, status, search } = req.query;
  let list = db.collection('users').find();

  if (role && role !== 'all') list = list.filter(u => u.role === role);
  if (status && status !== 'all') list = list.filter(u => u.status === status);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.department && u.department.toLowerCase().includes(s)));
  }

  // Populate assignment or profile snippets
  const populated = list.map(u => {
    let extra = {};
    if (u.role === 'mentee') {
      const assign = db.collection('assignments').findOne({ menteeId: u.id, status: 'active' });
      if (assign) {
        const m = db.collection('users').findById(assign.mentorId);
        extra.assignedMentor = m ? m.name : 'Unknown';
      } else {
        extra.assignedMentor = 'Unassigned';
      }
    } else if (u.role === 'mentor') {
      const activeCount = db.collection('assignments').find({ mentorId: u.id, status: 'active' }).length;
      const mprof = db.collection('mentor_profiles').findOne({ userId: u.id });
      extra.activeMenteesCount = activeCount;
      extra.maxMentees = mprof ? mprof.maxMentees : 3;
    }
    return { ...u, ...extra };
  });

  res.json(populated);
});

// User status toggle (activate / deactivate)
router.patch('/users/:id/status', (req, res) => {
  const { status } = req.body;
  const user = db.collection('users').findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = db.collection('users').updateById(user.id, { status });

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: status === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    target: user.name + ' (' + user.email + ')',
    details: 'Status changed to ' + status,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.json({ success: true, user: updated });
});

// Mentor approval list
router.get('/mentor-approvals', (req, res) => {
  const pendingMentors = db.collection('users').find({ role: 'mentor', status: 'pending' });
  const list = pendingMentors.map(m => {
    const profile = db.collection('mentor_profiles').findOne({ userId: m.id });
    return { ...m, profile };
  });
  res.json(list);
});

// Approve or Reject mentor
router.patch('/mentor-approvals/:id', (req, res) => {
  const { decision, reason } = req.body; // 'approve' | 'reject'
  const user = db.collection('users').findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newStatus = decision === 'approve' ? 'active' : 'inactive';
  const updated = db.collection('users').updateById(user.id, { status: newStatus });

  db.collection('notifications').insert({
    userId: user.id,
    title: decision === 'approve' ? 'Mentor Application Approved' : 'Mentor Application Update',
    message: decision === 'approve'
      ? 'Congratulations! Your mentor account has been approved. You may now access the mentor dashboard.'
      : 'Your mentor application could not be approved at this time: ' + (reason || 'Qualifications review pending'),
    category: 'system',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentor/dashboard'
  });

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: decision === 'approve' ? 'APPROVE_MENTOR' : 'REJECT_MENTOR',
    target: user.name,
    details: 'Reason: ' + (reason || 'Standard review criteria met'),
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.json({ success: true, user: updated });
});

// Transparent Matching Engine
router.get('/matching', (req, res) => {
  const mentees = db.collection('users').find({ role: 'mentee', status: 'active' });
  const activeAssignments = db.collection('assignments').find({ status: 'active' });
  const assignedMenteeIds = new Set(activeAssignments.map(a => a.menteeId));

  const unassigned = mentees.filter(m => !assignedMenteeIds.has(m.id)).map(m => {
    const profile = db.collection('mentee_profiles').findOne({ userId: m.id });
    return { ...m, profile };
  });

  const mentors = db.collection('users').find({ role: 'mentor', status: 'active' }).map(m => {
    const profile = db.collection('mentor_profiles').findOne({ userId: m.id });
    const currentCount = activeAssignments.filter(a => a.mentorId === m.id).length;
    return { ...m, profile, currentMenteesCount: currentCount, maxMentees: profile ? profile.maxMentees : 3 };
  });

  // Calculate explainable match scores for each unassigned mentee against available mentors
  const matchRecommendations = unassigned.map(mentee => {
    const mProfile = mentee.profile || {};
    const menteeSkills = new Set(mProfile.targetSkills || mProfile.skills || []);
    const menteeDept = mentee.department || '';

    const mentorMatches = mentors.map(mentor => {
      const prof = mentor.profile || {};
      const mentorExpertise = prof.expertise || [];

      // 1. Expertise overlap score (up to 40 pts)
      let matchedSkills = mentorExpertise.filter(s => menteeSkills.has(s) || (mProfile.targetSkills && mProfile.targetSkills.includes(s)));
      let expertiseScore = Math.min(40, matchedSkills.length * 15);

      // 2. Department synergy score (up to 25 pts)
      let deptScore = (mentor.department === menteeDept && menteeDept) ? 25 : 10;

      // 3. Availability and capacity score (up to 20 pts)
      let remainingCapacity = Math.max(0, (mentor.maxMentees || 3) - mentor.currentMenteesCount);
      let capacityScore = remainingCapacity > 0 ? 20 : 0;

      // 4. Style & Cadence alignment (up to 15 pts)
      let formatScore = (prof.availability && prof.availability.format === mProfile.meetingFormat) ? 15 : 10;

      const totalScore = Math.min(99, Math.max(45, expertiseScore + deptScore + capacityScore + formatScore));

      const reasons = [];
      if (matchedSkills.length > 0) reasons.push(`Expertise overlap in ${matchedSkills.slice(0, 2).join(', ')}`);
      if (mentor.department === menteeDept) reasons.push(`Identical department: ${menteeDept}`);
      if (remainingCapacity > 0) reasons.push(`Mentor has open capacity (${remainingCapacity} slots available)`);
      if (prof.availability && prof.availability.format) reasons.push(`Preferred meeting format aligned (${mProfile.meetingFormat || 'Online'})`);

      return {
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorAvatar: mentor.avatar,
        mentorTitle: prof.title || 'Mentor Specialist',
        department: mentor.department,
        matchScore: totalScore,
        reasons,
        remainingCapacity,
        isCapacityFull: remainingCapacity === 0
      };
    });

    mentorMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      mentee,
      suggestedMentors: mentorMatches
    };
  });

  res.json({
    unassignedMentees: unassigned,
    activeAssignments: activeAssignments.map(a => {
      const mentee = db.collection('users').findById(a.menteeId);
      const mentor = db.collection('users').findById(a.mentorId);
      return {
        ...a,
        menteeName: mentee ? mentee.name : 'Mentee',
        menteeEmail: mentee ? mentee.email : '',
        menteeDepartment: mentee ? mentee.department : '',
        mentorName: mentor ? mentor.name : 'Mentor',
        mentorEmail: mentor ? mentor.email : ''
      };
    }),
    matchRecommendations
  });
});

// Assign or Reassign Mentee
router.post('/assignments', (req, res) => {
  const { menteeId, mentorId, matchScore, matchReasons, notes } = req.body;
  if (!menteeId || !mentorId) {
    return res.status(400).json({ error: 'Mentee and Mentor IDs are required' });
  }

  // Deactivate any existing assignment
  const existing = db.collection('assignments').find({ menteeId, status: 'active' });
  existing.forEach(e => {
    db.collection('assignments').updateById(e.id, { status: 'reassigned' });
  });

  const mentee = db.collection('users').findById(menteeId);
  const mentor = db.collection('users').findById(mentorId);

  const newAssignment = db.collection('assignments').insert({
    mentorId,
    menteeId,
    status: 'active',
    matchScore: matchScore || 90,
    matchReasons: matchReasons || ['Administrative manual pairing'],
    assignedAt: new Date().toISOString(),
    assignedBy: req.user.name,
    notes: notes || 'Pairing confirmed by administrator'
  });

  // Notify mentee and mentor
  db.collection('notifications').insert({
    userId: menteeId,
    title: 'Mentor Assigned!',
    message: `You have been paired with ${mentor ? mentor.name : 'your mentor'}. Reach out to say hello!`,
    category: 'assignment',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentee/mentor'
  });

  db.collection('notifications').insert({
    userId: mentorId,
    title: 'New Mentee Assigned!',
    message: `${mentee ? mentee.name : 'A new mentee'} has been assigned to your mentoring group.`,
    category: 'assignment',
    read: false,
    createdAt: new Date().toISOString(),
    actionLink: '/mentor/assigned'
  });

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: 'ASSIGN_MENTEE',
    target: `${mentee ? mentee.name : menteeId} -> ${mentor ? mentor.name : mentorId}`,
    details: `Compatibility match score: ${newAssignment.matchScore}%`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({ success: true, assignment: newAssignment });
});

// Delete / Unassign assignment
router.delete('/assignments/:id', (req, res) => {
  const assign = db.collection('assignments').findById(req.params.id);
  if (!assign) return res.status(404).json({ error: 'Assignment not found' });

  db.collection('assignments').updateById(assign.id, { status: 'reassigned' });

  db.collection('audit_logs').insert({
    actorId: req.user.id,
    actorName: req.user.name,
    action: 'UNASSIGN_MENTEE',
    target: assign.id,
    details: 'Mentee returned to unassigned pool.',
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  res.json({ success: true, message: 'Assignment ended' });
});

// Workload Distribution
router.get('/workload', (req, res) => {
  const mentors = db.collection('users').find({ role: 'mentor', status: 'active' });
  const assignments = db.collection('assignments').find({ status: 'active' });

  const data = mentors.map(m => {
    const prof = db.collection('mentor_profiles').findOne({ userId: m.id });
    const current = assignments.filter(a => a.mentorId === m.id).length;
    const max = prof ? (prof.maxMentees || 3) : 3;
    const utilization = Math.round((current / max) * 100);

    return {
      mentorId: m.id,
      name: m.name,
      department: m.department,
      currentMentees: current,
      maxMentees: max,
      utilizationPercent: utilization,
      isAtCapacity: current >= max
    };
  });

  res.json(data);
});

// Audit Logs
router.get('/audit-logs', (req, res) => {
  const logs = db.collection('audit_logs').find();
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(logs);
});

// Announcements
router.get('/announcements', (req, res) => {
  const anns = db.collection('announcements').find();
  anns.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  res.json(anns);
});

router.post('/announcements', (req, res) => {
  const { title, content, targetAudience, priority } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const newAnn = db.collection('announcements').insert({
    title,
    content,
    targetAudience: targetAudience || 'all',
    authorId: req.user.id,
    authorName: req.user.name,
    priority: priority || 'medium',
    publishedAt: new Date().toISOString()
  });

  // Broadcast notifications to relevant users
  const users = db.collection('users').find({ status: 'active' });
  users.forEach(u => {
    if (newAnn.targetAudience === 'all' || (newAnn.targetAudience === 'mentees' && u.role === 'mentee') || (newAnn.targetAudience === 'mentors' && u.role === 'mentor')) {
      db.collection('notifications').insert({
        userId: u.id,
        title: 'Announcement: ' + title,
        message: content.length > 80 ? content.substring(0, 80) + '...' : content,
        category: 'announcement',
        read: false,
        createdAt: new Date().toISOString(),
        actionLink: u.role === 'mentor' ? '/mentor/dashboard' : '/mentee/dashboard'
      });
    }
  });

  res.status(201).json(newAnn);
});

// Departments & Skills
router.get('/departments', (req, res) => {
  res.json({
    departments: db.collection('departments').find(),
    skills: db.collection('skills_taxonomy').find()
  });
});

router.post('/departments', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name required' });
  const item = db.collection('departments').insert({ name });
  res.status(201).json(item);
});

// Program Settings
router.get('/settings', (req, res) => {
  const settings = db.collection('program_settings').find();
  res.json(settings[0] || {});
});

router.put('/settings', (req, res) => {
  const settings = db.collection('program_settings').find();
  if (settings.length > 0) {
    const updated = db.collection('program_settings').updateById(settings[0].id, req.body);
    return res.json(updated);
  }
  const created = db.collection('program_settings').insert(req.body);
  res.json(created);
});

// CSV Export Endpoint
router.get('/reports/export-csv', (req, res) => {
  const assignments = db.collection('assignments').find({ status: 'active' });
  const tasks = db.collection('tasks').find();
  const recs = db.collection('recommendations').find();

  let csv = 'Mentee Name,Mentee Email,Department,Assigned Mentor,Match Score,Completed Tasks,Total Tasks,Active Recommendations\n';

  assignments.forEach(a => {
    const mentee = db.collection('users').findById(a.menteeId);
    const mentor = db.collection('users').findById(a.mentorId);
    const menteeTasks = tasks.filter(t => t.menteeId === a.menteeId);
    const completedTasks = menteeTasks.filter(t => t.status === 'completed').length;
    const menteeRecs = recs.filter(r => r.menteeId === a.menteeId && r.status !== 'completed').length;

    const row = [
      `"${mentee ? mentee.name : 'Unknown'}"`,
      `"${mentee ? mentee.email : ''}"`,
      `"${mentee ? mentee.department : ''}"`,
      `"${mentor ? mentor.name : 'Unknown'}"`,
      `${a.matchScore}%`,
      completedTasks,
      menteeTasks.length,
      menteeRecs
    ].join(',');

    csv += row + '\n';
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('MentorConnect_Program_Report_2026.csv');
  res.send(csv);
});

// Reset data back to initial seed
router.post('/reset-data', (req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Platform data has been reset to rich seed defaults.' });
});

export default router;
