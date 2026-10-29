# MentorConnect – Mentor–Mentee Management Platform

**MentorConnect** is a full-stack web application designed to connect mentees with mentors, facilitate goal tracking and skill development, and provide complete program oversight for administrators.

---

## Quick Start Guide

### 1. Start the Backend API Server
```bash
cd server
npm start
```
- **Port**: `5000`
- **Health Check**: `http://localhost:5000/api/health`
- **Database**: Zero-setup, persistent file-backed JSON DataStore (`server/data/db.json`). Automatically initializes with rich demo data if not present.

### 2. Start the Frontend Application
```bash
cd client
npm run dev
```
- **URL**: `http://localhost:3000`
- **Vite Server**: Configured with `@tailwindcss/vite` and automatic `/api` proxying to port 5000.

---

## Demo Accounts & 1-Click Persona Switcher

A persistent **Persona Switcher** is pinned to the header of every page. You can click to switch roles instantly without logging in again:

| Role | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Mentee** | `alex.chen@mentorconnect.io` | `password123` | 5-step onboarding, view assigned mentor, accept/decline recommendations, submit task deliverables, book 1-on-1 sessions, track goal roadmaps, and chat. |
| **Mentor** | `dr.sarah@mentorconnect.io` | `password123` | View assigned mentees, record private notes, publish recommendations (12 categories), assign and review tasks, schedule sessions, and manage availability. |
| **Admin** | `admin@mentorconnect.io` | `password123` | KPI analytics, user directory, mentor approval queue, transparent algorithmic matching, mentor workload balancer, announcements, audit logs, and CSV report export. |

---

## Key Features & Architecture

- **High-Contrast Dark Mode**: Designed with a slate-950/900 palette, rich cyan/indigo/emerald accents, custom scrollbars, and Lucide icons.
- **Explainable Matching Engine**: Matches mentees with mentors based on expertise overlap (40 pts), department synergy (25 pts), availability (20 pts), and format alignment (15 pts).
- **Recommendation Lifecycle**: Draft → Published → Viewed → Accepted/Declined → In Progress → Completed.
- **Object-Level Security**: Mentors cannot view unassigned mentees; private mentoring notes are strictly hidden from mentees.
- **Reports & Data Export**: One-click CSV export of cohort statistics and participation metrics.
- **Data Reset**: Admins can reset the platform back to default seed data at any time via the Program Settings page.
