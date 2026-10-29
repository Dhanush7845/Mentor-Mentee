import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Mentee
import { MenteeDashboard } from './pages/mentee/MenteeDashboard';
import { MenteeProfile } from './pages/mentee/MenteeProfile';
import { MenteeOnboarding } from './pages/mentee/MenteeOnboarding';
import { MyMentor } from './pages/mentee/MyMentor';
import { Recommendations } from './pages/mentee/Recommendations';
import { DevelopmentPlanPage } from './pages/mentee/DevelopmentPlan';
import { MyTasks } from './pages/mentee/MyTasks';
import { GoalsMilestones } from './pages/mentee/GoalsMilestones';
import { ProgressAnalytics } from './pages/mentee/ProgressAnalytics';
import { MessagesPage } from './pages/mentee/Messages';
import { SessionsCalendar } from './pages/mentee/SessionsCalendar';
import { ProgressReports } from './pages/mentee/ProgressReports';
import { NotificationsPage } from './pages/mentee/NotificationsPage';
import { AccountSettings } from './pages/mentee/AccountSettings';

// Mentor
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { AssignedMentees } from './pages/mentor/AssignedMentees';
import { MenteeProfileDetails } from './pages/mentor/MenteeProfileDetails';
import { RecommendationManagement } from './pages/mentor/RecommendationManagement';
import { DevelopmentPlanBuilder } from './pages/mentor/DevelopmentPlanBuilder';
import { TaskManager } from './pages/mentor/TaskManager';
import { ProgressAssessments } from './pages/mentor/ProgressAssessments';
import { MentorMessages } from './pages/mentor/MentorMessages';
import { SessionManagement } from './pages/mentor/SessionManagement';
import { MentorAvailability } from './pages/mentor/MentorAvailability';
import { MentorReports } from './pages/mentor/MentorReports';
import { MentorProfileSettings } from './pages/mentor/MentorProfileSettings';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { MentorApproval } from './pages/admin/MentorApproval';
import { MatchingManagement } from './pages/admin/MatchingManagement';
import { WorkloadManagement } from './pages/admin/WorkloadManagement';
import { DepartmentsCategories } from './pages/admin/DepartmentsCategories';
import { ProgramManagement } from './pages/admin/ProgramManagement';
import { SessionMonitoring } from './pages/admin/SessionMonitoring';
import { RecommendationTaskMonitoring } from './pages/admin/RecommendationTaskMonitoring';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { AnnouncementsManagement } from './pages/admin/AnnouncementsManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { RolesPermissions } from './pages/admin/RolesPermissions';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string | string[] }> = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role || '')) {
      return <Navigate to="/" replace />;
    }
  }
  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    const redirect = user.role === 'admin' ? '/admin/dashboard' : user.role === 'mentor' ? '/mentor/dashboard' : '/mentee/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user } = useAuth();

  const defaultRedirect = user
    ? user.role === 'admin' ? '/admin/dashboard'
    : user.role === 'mentor' ? '/mentor/dashboard'
    : '/mentee/dashboard'
    : '/';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Mentee Routes */}
      <Route path="/mentee" element={<ProtectedRoute role="mentee"><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/mentee/dashboard" replace />} />
        <Route path="dashboard" element={<MenteeDashboard />} />
        <Route path="profile" element={<MenteeProfile />} />
        <Route path="onboarding" element={<MenteeOnboarding />} />
        <Route path="mentor" element={<MyMentor />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="development-plan" element={<DevelopmentPlanPage />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="goals" element={<GoalsMilestones />} />
        <Route path="progress" element={<ProgressAnalytics />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="sessions" element={<SessionsCalendar />} />
        <Route path="reports" element={<ProgressReports />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* Mentor Routes */}
      <Route path="/mentor" element={<ProtectedRoute role="mentor"><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/mentor/dashboard" replace />} />
        <Route path="dashboard" element={<MentorDashboard />} />
        <Route path="assigned" element={<AssignedMentees />} />
        <Route path="mentee/:menteeId" element={<MenteeProfileDetails />} />
        <Route path="recommendations" element={<RecommendationManagement />} />
        <Route path="development-plan" element={<DevelopmentPlanBuilder />} />
        <Route path="tasks" element={<TaskManager />} />
        <Route path="assessments" element={<ProgressAssessments />} />
        <Route path="messages" element={<MentorMessages />} />
        <Route path="sessions" element={<SessionManagement />} />
        <Route path="availability" element={<MentorAvailability />} />
        <Route path="reports" element={<MentorReports />} />
        <Route path="settings" element={<MentorProfileSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="approvals" element={<MentorApproval />} />
        <Route path="matching" element={<MatchingManagement />} />
        <Route path="workload" element={<WorkloadManagement />} />
        <Route path="departments" element={<DepartmentsCategories />} />
        <Route path="program" element={<ProgramManagement />} />
        <Route path="sessions" element={<SessionMonitoring />} />
        <Route path="monitoring" element={<RecommendationTaskMonitoring />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="announcements" element={<AnnouncementsManagement />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="roles" element={<RolesPermissions />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
};

export default App;
