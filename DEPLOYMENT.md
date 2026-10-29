# MentorConnect Deployment Guide

This guide walks you through deploying **MentorConnect**:
- **Database**: Supabase (Managed PostgreSQL)
- **Backend API**: Render (Web Service)
- **Frontend App**: Vercel (Single Page App)

---

## Step 1: Set Up Database on Supabase

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Click **New project** and name it `mentor-connect` (choose a strong database password and your preferred region).
3. Once the project finishes provisioning:
   - Go to **Project Settings** (gear icon) &rarr; **Database**.
   - Under **Connection string**, select **URI** and choose **Transaction Pooler** (or direct connection).
   - Copy the connection string. It will look like:
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
     *(Be sure to replace `[YOUR-PASSWORD]` with your actual database password!)*
4. *(Optional)* Go to the **SQL Editor** in Supabase and run the script from [`supabase/schema.sql`](./supabase/schema.sql) if you want to inspect relational tables in the Table Editor. *(The backend also auto-creates and initializes the storage table on startup).*

---

## Step 2: Deploy Backend to Render

1. Go to **[render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** &rarr; **Web Service**.
3. Select your repository: `Dhanush7845/Mentor-Mentee`.
4. Configure the service settings:
   - **Name**: `mentor-connect-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. In the **Environment Variables** section, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `JWT_SECRET` | *(Generate any random 32-char string)* | For auth tokens |
   | `DATABASE_URL` | *(Your Supabase connection string from Step 1)* | Connects backend to Supabase |
6. Click **Create Web Service**.
7. Once deployed, Render will provide your public backend URL, e.g.:
   `https://mentor-connect-api.onrender.com`
   *(Verify by opening `https://mentor-connect-api.onrender.com/api/health` — it will return `{"status":"healthy"}`)*.

---

## Step 3: Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Import your repository: `Dhanush7845/Mentor-Mentee`.
4. In the project configuration:
   - **Root Directory**: Click "Edit" and choose `client` (or leave default if deploying from root, since `vercel.json` is provided).
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In the **Environment Variables** section, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://mentor-connect-api.onrender.com` *(Your Render URL from Step 2, without trailing slash)* |
6. Click **Deploy**.
7. Vercel will build the frontend and provide your live application URL, e.g.:
   `https://mentor-connect.vercel.app`

---

## Step 4: Verify Live Integration

1. Open your live Vercel URL.
2. The landing page and all 48 routes will load with full high-contrast dark mode styling.
3. Use the **1-Click Demo Persona Switcher** in the top navigation header to test Mentee, Mentor, and Admin workflows.
4. Data changes (tasks, recommendations, sessions, pairings) will persist directly to your **Supabase PostgreSQL database**!
