-- ==============================================================================
-- MentorConnect – Supabase PostgreSQL Database Schema
-- Run this in your Supabase Project -> SQL Editor to initialize relational tables
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Storage Table (Used by the Render Backend API for High-Performance Storage)
CREATE TABLE IF NOT EXISTS mentorconnect_data (
  collection_name VARCHAR(100) PRIMARY KEY,
  records JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Relational Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('mentee', 'mentor', 'admin')),
  department VARCHAR(100),
  avatar TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Mentee Profiles Table
CREATE TABLE IF NOT EXISTS mentee_profiles (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  current_degree VARCHAR(255),
  institution VARCHAR(255),
  academic_year VARCHAR(100),
  target_role VARCHAR(255),
  skills JSONB DEFAULT '[]'::jsonb,
  target_skills JSONB DEFAULT '[]'::jsonb,
  career_goals TEXT,
  preferred_frequency VARCHAR(50) DEFAULT 'bi-weekly',
  meeting_format VARCHAR(50) DEFAULT 'online',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Mentor Profiles Table
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  company VARCHAR(255),
  bio TEXT,
  expertise JSONB DEFAULT '[]'::jsonb,
  max_mentees INT DEFAULT 3,
  availability JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Assignments / Pairings Table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(100) PRIMARY KEY,
  mentor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  mentee_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed')),
  match_score INT DEFAULT 90,
  match_reasons JSONB DEFAULT '[]'::jsonb,
  assigned_by VARCHAR(255),
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id VARCHAR(100) PRIMARY KEY,
  mentor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  mentee_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  difficulty VARCHAR(50) DEFAULT 'intermediate',
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'viewed', 'accepted', 'declined', 'in_progress', 'completed')),
  due_date VARCHAR(50),
  resource_url TEXT,
  clarification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(100) PRIMARY KEY,
  mentee_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  mentor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  due_date VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  evidence_url TEXT,
  submission_notes TEXT,
  mentor_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Mentoring Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(100) PRIMARY KEY,
  mentor_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  mentee_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  duration_minutes INT DEFAULT 60,
  meeting_link TEXT,
  agenda TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  mentor_notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  mentee_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(100) PRIMARY KEY,
  mentee_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'short-term',
  target_date VARCHAR(50),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status VARCHAR(50) DEFAULT 'in-progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(100) PRIMARY KEY,
  sender_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  receiver_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  action_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  actor_id VARCHAR(100),
  actor_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255),
  details TEXT,
  ip VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all',
  priority VARCHAR(50) DEFAULT 'medium',
  author_id VARCHAR(100),
  author_name VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_assignments_mentor ON assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_mentee ON assignments(mentee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_mentee ON tasks(mentee_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_mentee ON recommendations(mentee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participants ON sessions(mentor_id, mentee_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
