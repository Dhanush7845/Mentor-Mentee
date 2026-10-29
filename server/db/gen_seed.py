# Generates seedData.js
import json

data = {
  'users': [
    {'id': 'admin-1', 'name': 'System Administrator', 'email': 'admin@mentorconnect.io', 'role': 'admin', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'department': 'Administration', 'createdAt': '2026-09-01T08:00:00Z', 'lastLogin': '2026-10-29T11:00:00Z'},
    {'id': 'mentor-1', 'name': 'Dr. Sarah Jenkins', 'email': 'dr.sarah@mentorconnect.io', 'role': 'mentor', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'department': 'Computer Science & AI', 'createdAt': '2026-09-10T09:30:00Z', 'lastLogin': '2026-10-29T10:15:00Z'},
    {'id': 'mentor-2', 'name': 'Marcus Vance', 'email': 'marcus.vance@mentorconnect.io', 'role': 'mentor', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'department': 'Software Engineering', 'createdAt': '2026-09-12T14:00:00Z', 'lastLogin': '2026-10-28T16:20:00Z'},
    {'id': 'mentor-3', 'name': 'Elena Rostova', 'email': 'elena.rostova@mentorconnect.io', 'role': 'mentor', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'department': 'Human-Computer Interaction', 'createdAt': '2026-09-15T11:20:00Z', 'lastLogin': '2026-10-27T09:00:00Z'},
    {'id': 'mentor-4', 'name': 'David Okonkwo', 'email': 'david.okonkwo@mentorconnect.io', 'role': 'mentor', 'status': 'pending', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'department': 'Cloud & Distributed Systems', 'createdAt': '2026-10-25T15:45:00Z', 'lastLogin': '2026-10-25T15:45:00Z'},
    {'id': 'mentee-1', 'name': 'Alex Chen', 'email': 'alex.chen@mentorconnect.io', 'role': 'mentee', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'department': 'Computer Science & AI', 'createdAt': '2026-09-18T10:00:00Z', 'lastLogin': '2026-10-29T11:20:00Z'},
    {'id': 'mentee-2', 'name': 'Priya Patel', 'email': 'priya.patel@mentorconnect.io', 'role': 'mentee', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'department': 'Data Science & Analytics', 'createdAt': '2026-09-20T12:30:00Z', 'lastLogin': '2026-10-28T14:10:00Z'},
    {'id': 'mentee-3', 'name': 'Jordan Taylor', 'email': 'jordan.taylor@mentorconnect.io', 'role': 'mentee', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'department': 'Human-Computer Interaction', 'createdAt': '2026-10-22T08:15:00Z', 'lastLogin': '2026-10-29T09:40:00Z'},
    {'id': 'mentee-4', 'name': 'Samira Khan', 'email': 'samira.khan@mentorconnect.io', 'role': 'mentee', 'status': 'active', 'avatar': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'department': 'Cloud & Distributed Systems', 'createdAt': '2026-10-24T16:00:00Z', 'lastLogin': '2026-10-26T18:00:00Z'}
  ]
}
