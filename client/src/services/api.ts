const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_HOST}/api`;

function getHeaders(token?: string | null) {
  const currentToken = token || localStorage.getItem('mentor_connect_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mentor_connect_token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed with status ' + res.status }));
    throw new Error(errorData.error || 'Server error');
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  switchDemo: (role: 'mentee' | 'mentor' | 'admin') =>
    request<{ token: string; user: any }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () => request<{ user: any; profile: any }>('/auth/me'),

  // Mentee
  getMenteeProfile: () => request<{ user: any; profile: any }>('/mentees/profile'),
  updateMenteeProfile: (data: any) =>
    request<{ success: boolean; profile: any; message: string }>('/mentees/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAssignedMentor: () => request<{ assigned: boolean; mentor: any; assignment: any }>('/mentees/mentor'),
  requestMentorChange: (data: { reason: string; targetDomain?: string; notes?: string }) =>
    request<{ success: boolean; message: string }>('/mentees/change-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMenteeStats: () => request<any>('/mentees/stats'),

  // Mentor
  getAssignedMentees: () => request<any[]>('/mentors/assigned'),
  getMenteeDetails: (menteeId: string) => request<any>(`/mentors/mentee/${menteeId}`),
  getMentorNotes: (menteeId: string) => request<any[]>(`/mentors/notes/${menteeId}`),
  addMentorNote: (menteeId: string, note: string) =>
    request<any>('/mentors/notes', {
      method: 'POST',
      body: JSON.stringify({ menteeId, note }),
    }),
  getMentorProfile: () => request<{ user: any; profile: any }>('/mentors/profile'),
  updateMentorProfile: (data: any) =>
    request<{ success: boolean; profile: any }>('/mentors/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateAvailability: (data: any) =>
    request<any>('/mentors/availability', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getMentorReports: () => request<any>('/mentors/reports'),

  // Recommendations
  getRecommendations: (params?: { menteeId?: string; status?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/recommendations${q ? `?${q}` : ''}`);
  },
  createRecommendation: (data: any) =>
    request<any>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRecommendation: (id: string, data: any) =>
    request<any>(`/recommendations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateRecommendationStatus: (id: string, status: string, note?: string) =>
    request<any>(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
  clarifyRecommendation: (id: string, question: string) =>
    request<any>(`/recommendations/${id}/clarify`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  deleteRecommendation: (id: string) =>
    request<any>(`/recommendations/${id}`, { method: 'DELETE' }),

  // Development Plans
  getDevelopmentPlan: (menteeId: string = 'me') => request<any>(`/plans/${menteeId}`),
  saveDevelopmentPlan: (data: any) =>
    request<any>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tasks
  getTasks: (params?: { menteeId?: string; status?: string; priority?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/tasks${q ? `?${q}` : ''}`);
  },
  createTask: (data: any) =>
    request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, data: any) =>
    request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  submitTaskEvidence: (id: string, data: { evidenceUrl?: string; submissionNotes?: string }) =>
    request<any>(`/tasks/${id}/submit`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  reviewTask: (id: string, data: { feedback: string; status?: string }) =>
    request<any>(`/tasks/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: (menteeId?: string) =>
    request<any[]>(`/goals${menteeId ? `?menteeId=${menteeId}` : ''}`),
  createGoal: (data: any) =>
    request<any>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGoal: (id: string, data: any) =>
    request<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGoal: (id: string) => request<any>(`/goals/${id}`, { method: 'DELETE' }),

  // Sessions
  getSessions: () => request<any[]>('/sessions'),
  createSession: (data: any) =>
    request<any>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSession: (id: string, data: any) =>
    request<any>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  submitSessionFeedback: (id: string, data: { feedback: string; rating: number }) =>
    request<any>(`/sessions/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  updateSessionNotes: (id: string, data: { mentorNotes?: string; actionItems?: string[]; status?: string }) =>
    request<any>(`/sessions/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteSession: (id: string) => request<any>(`/sessions/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: (otherUserId: string) => request<any[]>(`/messages/${otherUserId}`),
  sendMessage: (receiverId: string, content: string) =>
    request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),
  markMessagesRead: (otherUserId: string) =>
    request<any>(`/messages/read/${otherUserId}`, { method: 'PATCH' }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Progress Reports
  getProgressReports: () => request<any[]>('/reports'),
  submitProgressReport: (data: any) =>
    request<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminOverview: () => request<any>('/admin/overview'),
  getAdminUsers: (params?: { role?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/admin/users${q ? `?${q}` : ''}`);
  },
  updateUserStatus: (id: string, status: string) =>
    request<any>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getMentorApprovals: () => request<any[]>('/admin/mentor-approvals'),
  handleMentorApproval: (id: string, decision: 'approve' | 'reject', reason?: string) =>
    request<any>(`/admin/mentor-approvals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, reason }),
    }),
  getMatchingOverview: () => request<any>('/admin/matching'),
  assignMentor: (data: { menteeId: string; mentorId: string; matchScore?: number; matchReasons?: string[]; notes?: string }) =>
    request<any>('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  unassignMentor: (assignmentId: string) =>
    request<any>(`/admin/assignments/${assignmentId}`, { method: 'DELETE' }),
  getWorkload: () => request<any[]>('/admin/workload'),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),
  getAnnouncements: () => request<any[]>('/admin/announcements'),
  createAnnouncement: (data: any) =>
    request<any>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (data: any) =>
    request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getDepartments: () => request<any>('/admin/departments'),
  createDepartment: (name: string) =>
    request<any>('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  resetPlatformData: () => request<any>('/admin/reset-data', { method: 'POST' }),
};
