export type Role = 'mentee' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt?: string;
  lastLogin?: string;
}

export interface MenteeProfile {
  id?: string;
  userId: string;
  phone?: string;
  college?: string;
  academicYear?: string;
  studentId?: string;
  currentDegree?: string;
  graduationYear?: number;
  currentSemester?: string;
  resumeUrl?: string;
  resumeName?: string;
  previousInternships?: string;
  workExperience?: string;
  academicProjects?: string;
  achievements?: string;
  skills?: string[];
  softSkills?: string[];
  targetSkills?: string[];
  interests?: string[];
  learningStyle?: string;
  languages?: string[];
  shortTermGoals?: string;
  longTermGoals?: string;
  targetRole?: string;
  careerChallenges?: string;
  areasNeedingSupport?: string[];
  preferredFrequency?: string;
  meetingFormat?: string;
  preferredCommunication?: string;
  expectations?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  additionalComments?: string;
  onboardingCompleted?: boolean;
  profileVisibility?: 'mentor_only' | 'public_program';
  documentSharing?: boolean;
}

export interface MentorProfile {
  id?: string;
  userId: string;
  title: string;
  organization: string;
  yearsExperience: number;
  expertise: string[];
  bio: string;
  maxMentees: number;
  currentMenteesCount: number;
  availability?: {
    days: string[];
    hours: string;
    format: string;
  };
  linkedInUrl?: string;
  githubUrl?: string;
  rating?: number;
  totalSessionsHeld?: number;
}

export interface Assignment {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'active' | 'completed' | 'reassigned';
  matchScore: number;
  matchReasons: string[];
  assignedAt: string;
  assignedBy: string;
  notes?: string;
  menteeName?: string;
  menteeEmail?: string;
  menteeDepartment?: string;
  mentorName?: string;
  mentorEmail?: string;
}

export type RecommendationStatus = 'draft' | 'published' | 'viewed' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'archived';

export interface Recommendation {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  category: string;
  description: string;
  reason?: string;
  learningOutcome?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Challenging';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  dueDate: string;
  resourceUrl?: string;
  supportingDocs?: string;
  relatedSkill?: string;
  status: RecommendationStatus;
  clarificationNotes?: string;
  mentorName?: string;
  mentorAvatar?: string;
  menteeName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  completionPercent: number;
  description: string;
  linkedRecommendations?: string[];
  linkedTasks?: string[];
}

export interface DevelopmentPlan {
  id: string;
  menteeId: string;
  mentorId: string;
  title: string;
  overview?: string;
  milestones: Milestone[];
  updatedAt?: string;
}

export interface Task {
  id: string;
  menteeId: string;
  mentorId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'overdue';
  evidenceUrl?: string;
  submissionNotes?: string;
  feedback?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  menteeId: string;
  title: string;
  type: 'short_term' | 'long_term';
  targetDate: string;
  status: 'in_progress' | 'completed';
  progressPercent: number;
  notes?: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingLink: string;
  agenda: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  mentorNotes?: string;
  actionItems?: string[];
  menteeFeedback?: string;
  rating?: number | null;
  mentorName?: string;
  mentorAvatar?: string;
  menteeName?: string;
  menteeAvatar?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'assignment' | 'recommendation' | 'task' | 'session' | 'announcement' | 'system';
  read: boolean;
  createdAt: string;
  actionLink?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'mentees' | 'mentors';
  authorId: string;
  authorName: string;
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  ip: string;
}
