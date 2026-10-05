# EDULEARN - Modern Learning Management System (LMS)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](https://supabase.com/)

EduLearn is a modern, responsive full-stack Learning Management System designed to facilitate teacher-student interaction. It provides course browsing, course creation and enrollment, assignment distribution and submission, grading with real-time feedback, and secure role-based access control.

---

## 👥 Team Members
- **Team Lead:** D. Hema Sai — Amrita Vishwa Vidyapeetham, Chennai
- **Team Member 1:** P. Meghana — Mohan Babu University
- **Team Member 2:** C. Hema Naga Sree — Mohan Babu University
- **Team Member 3:** J. Harshitha — Sri Venkateswara College of Engineering

---

## 🚀 Key Features

### 🎓 For Students
- **Course Catalog:** Browse all available courses created by instructors and view enrollment details.
- **One-Click Enrollment:** Enroll into or unenroll from courses dynamically.
- **Assignment Tracker:** View upcoming assignments organized by course and track due dates.
- **Submission & Grading:** Submit assignment responses directly in-app, view submission status, grades, and teacher feedback.

### 👩‍🏫 For Teachers
- **Course Management:** Create and manage courses with duration and descriptions, plus delete or update courses.
- **Assignment Creation:** Assign homework, project tasks, or exercises with rich instructions and custom deadlines.
- **Assignment Overview:** View all assignments across courses with submission counts.
- **Grading & Feedback:** Review student submissions, assign numerical grades (0–100), and write constructive feedback in real time.

### 🛡️ Authentication & Security
- Secure role-based authentication (Student vs. Teacher) powered by Supabase Auth.
- Row-Level Security (RLS) policies protecting database tables and user records.
- Real-time updates via PostgreSQL change streams.

---

## 💻 Tech Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons, shadcn/ui components
- **Backend & Database:** Supabase (PostgreSQL with Row-Level Security, Auth, Realtime)
- **State Management & Data Fetching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form & Zod
- **Notifications:** Sonner toasts

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Meghanapothuraju/Edulearn.git
cd Edulearn
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
```

### 4. Database Setup (Supabase)
If setting up your own Supabase instance, run the migration SQL file located at:
```
supabase/migrations/20251017162010_7b47f482-944c-4b69-8437-9e2e1f1552b0.sql
```
in your Supabase SQL Editor. This initializes tables (`profiles`, `courses`, `enrollments`, `assignments`, `submissions`, `grades`), enums, and Row Level Security policies.

### 5. Run the Application
```bash
npm run dev
# or
npm start
```
The app will be accessible at `http://localhost:5173` (or the port specified by Vite).

### 6. Build for Production
```bash
npm run build
```

---

## 📄 License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
