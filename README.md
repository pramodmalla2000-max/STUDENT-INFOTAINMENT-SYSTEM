# STUDENT INFOTAINMENT — STUDENT 360° INFORMATION MANAGEMENT SYSTEM

> **One Student → One Complete Digital Profile**  
> A production-grade, centralized institutional intelligence platform for university administrators, instructional faculty, students, and parents.

---

## 🏛️ Problem Statement

Colleges and universities traditionally scatter student records across disconnected databases, departmental spreadsheets, and paper records. 

**Student Infotainment** solves this challenge by unifying:
1. **Single Point of Access**: Access entire personal, academic, attendance, marks, achievements, certificates, grievances, documents, and disciplinary data from one unified profile.
2. **Simplified Record Keeping**: Streamlined data entry, server-side pagination, search, and bulk operations for staff.
3. **Faculty Efficiency**: Instant student lookups (`Ctrl+K`), quick daily attendance sheets, and automated SGPA/CGPA evaluation.
4. **Transparent Parent Portal**: Real-time access for parents to view results, attendance alerts, grievances, and achievements for their linked children without modifying records.
5. **Role-Based Security & Data Isolation**: Strict backend enforcement ensuring students and parents access only their own authorized records.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6, TanStack Query, React Hook Form, Zod |
| **Backend** | Node.js, Express.js, TypeScript, REST API, JWT Authentication, bcryptjs, Zod, Helmet, CORS, express-rate-limit, Multer, Swagger UI |
| **Database** | MongoDB & Mongoose (Fully compatible with MongoDB Compass & MongoDB Atlas) |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Key Features

### 1. Student 360° Comprehensive Profile
An all-inclusive 12-tab institutional digital portfolio:
- **Overview**: Academic metrics, GPA bracket, attendance meter, recent achievements, profile completion progress bar.
- **Personal**: Demographics, blood group, contact information, permanent address, parent/guardian details.
- **Academic**: Student ID, Roll Number, Admission number, Department, Degree course, Batch, Semester, Section.
- **Attendance**: Total conducted vs attended classes, subject-wise breakdown, mandatory 75% cutoff warnings.
- **Results & Marks**: Semester-by-semester marksheets, internal/external split, credits, SGPA, and cumulative CGPA.
- **Achievements**: Hackathons, international conferences, sports titles, and competitive programming ranks with faculty verification tags.
- **Certificates**: Cryptographically verifiable institutional credentials with public verification URLs.
- **Grievances & Complaints**: Student issue filing with lifecycle tracking (OPEN → IN_PROGRESS → RESOLVED).
- **Documents Vault**: Uploaded marksheets, identity proof, bonafide letters, and transfer certificates.
- **Placement & Career**: Campus recruitment records, company offers (e.g. Google India, Microsoft), CTC (LPA), and internship details.
- **Discipline**: Institutional incident records, actions taken, and status.
- **Activity Timeline**: Unified chronological timeline capturing every academic and extracurricular milestone.

### 2. Multi-Role RBAC (Role-Based Access Control)
- **SUPER_ADMIN**: Full system governance, administrative user management, institution configuration, audit surveillance.
- **ADMIN**: Student directory CRUD, faculty rosters, attendance & marks publishing, complaint resolution, report exports.
- **FACULTY**: Student roster access, daily classroom attendance marking, grade calculation, achievement approvals.
- **STUDENT**: Self-profile view, attendance status, semester results, achievement submission, grievance ticketing.
- **PARENT**: Linked child academic overview, attendance compliance, marksheet reports, notifications (read-only).

### 3. Institutional Security & Data Isolation Guard
- **Strict Data Isolation**: Backend middleware `studentAccessGuard` guarantees that Student A cannot query Student B, and Parent A cannot inspect records of students other than their linked child.
- **Brute-force Protection**: Rate limiting with `express-rate-limit` (1000 requests per 15 min window).
- **Auditing**: Every critical administrative action (logins, student creation, attendance submissions, result declarations) is immutably logged in `auditLogs`.

### 4. Lightning-Fast Global Search (`Ctrl+K`)
- Instant debounced multi-collection search querying students by Name, Student ID (e.g. `25B21AI024`), Roll Number, Faculty, Departments, and Achievements.

### 5. Public Credential Verifier
- Dedicated verification page at `/verify/certificate/:certificateNumber` enabling external recruiters and universities to authenticate student credentials publicly.

---

## 📁 Repository Structure

```text
student-infotainment/
│
├── client/                               # Frontend SPA (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/                          # Centralized Fetch Client with Bearer token injection
│   │   ├── components/common/            # Navbar, Sidebar, GlobalSearchModal, Badges, Loaders
│   │   ├── context/                      # AuthContext, ThemeContext (Light & Dark mode)
│   │   ├── layouts/                      # DashboardLayout
│   │   ├── pages/
│   │   │   ├── admin/                    # AdminDashboard, StudentManagement, AttendanceManager, ResultManager, etc.
│   │   │   ├── student/                  # StudentDashboard, StudentProfile360
│   │   │   ├── faculty/                  # FacultyDashboard
│   │   │   ├── parent/                   # ParentDashboard
│   │   │   ├── complaints/               # ComplaintsList
│   │   │   ├── achievements/             # AchievementsList
│   │   │   └── certificates/             # CertificateVerifyPage
│   │   ├── routes/                       # AppRoutes with ProtectedRoute guards
│   │   └── types/                        # TypeScript domain interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                               # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/                       # db.ts (MongoDB connection), swagger.ts (OpenAPI spec)
│   │   ├── controllers/                  # auth, student, attendance, result, complaint, achievement, etc.
│   │   ├── middleware/                   # auth.ts (protect, authorize, studentAccessGuard), error.ts, upload.ts
│   │   ├── models/                       # 17 Mongoose models (Student, User, Result, Attendance, etc.)
│   │   ├── routes/                       # Modular Express routers
│   │   ├── scripts/                      # seed.ts (Realistic Indian university database seeder)
│   │   ├── tests/                        # runTests.ts (Automated security & RBAC integration test suite)
│   │   ├── types/                        # Backend TypeScript types
│   │   ├── utils/                        # jwt.ts, audit.ts
│   │   ├── app.ts                        # Express app configuration
│   │   └── server.ts                     # HTTP listener entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                    # Multi-container deployment (MongoDB, Server, Client)
├── .env.example                          # Environment template
├── package.json                          # Root orchestration scripts
└── README.md
```

---

## 🗄️ MongoDB & MongoDB Compass Setup

The application connects to MongoDB using the standard URI:
```env
MONGODB_URI=mongodb://localhost:27017/student_infotainment
```

### Steps to Inspect in MongoDB Compass:
1. Ensure MongoDB service is running (locally on port `27017` or via Docker).
2. Open **MongoDB Compass**.
3. In the **New Connection** screen, paste:
   ```text
   mongodb://localhost:27017/student_infotainment
   ```
4. Click **Connect**.
5. Once connected, open the database named `student_infotainment`.
6. You will see all 17 collections populated:
   - `users`, `students`, `parents`, `faculties`, `departments`, `courses`, `subjects`
   - `attendances`, `results`, `achievements`, `certificates`, `complaints`
   - `documentrecords`, `notifications`, `disciplinaryrecords`, `auditlogs`, `systemsettings`

---

## 🔑 Demo Login Credentials

The database seeder generates realistic Indian university records. You can log in using either email or Student ID:

| Role | Email / Student ID | Password | Access Highlights |
|---|---|---|---|
| **Super Admin** | `superadmin@studentinfotainment.local` | `SuperAdmin@123` | Full institution governance, logs, settings |
| **Admin** | `admin@studentinfotainment.local` | `Admin@123` | Student directory, attendance, results, reports |
| **Faculty** | `faculty@studentinfotainment.local` | `Faculty@123` | Class timetable, mark attendance, submit marks |
| **Student** | `student@studentinfotainment.local` *(or ID: `25B21AI024`)* | `Student@123` | Student 360° profile, results, attendance, grievances |
| **Parent** | `parent@studentinfotainment.local` | `Parent@123` | Linked child performance, attendance alerts |

> *Tip: The login screen includes **One-Click Demo Buttons** to autofill credentials instantly for fast evaluation!*

---

## ⚙️ Quickstart & Development Commands

### 1. Install Dependencies
```bash
# In the root folder:
npm run install:all
```

### 2. Environment Setup
Create `server/.env` based on `server/.env.example`:
```bash
cp server/.env.example server/.env
```

### 3. Seed Realistic University Demo Data
Populate 20 students, 20 parents, faculty, departments, marks, attendance, and achievements:
```bash
npm run seed
```

### 4. Run Automated Security & RBAC Test Suite
Validates authentication, student isolation (Student A blocked from Student B), public certificate verification, and aggregations:
```bash
npm test
```

### 5. Launch Full-Stack Application
Runs both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Interactive Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🐳 Docker Deployment

To launch MongoDB, Backend API, and Frontend using Docker:
```bash
docker compose up --build
```
- Client will be available at `http://localhost:5173`
- Backend API at `http://localhost:5000`
- MongoDB on `localhost:27017`

---

## 🛡️ Security & Architecture Verification Summary

- **Authentication**: JWT tokens signed with SHA-256 HMAC and 7-day expiration.
- **Passwords**: One-way bcrypt hashing with salt rounds = 10. Raw passwords never stored or logged.
- **Role Isolation**: Strict backend enforcement — Student A cannot read Student B records; Parent A cannot read other students' children.
- **No Mock Data**: Every chart, table, KPI, and profile is populated from MongoDB aggregation pipelines.
- **Audit Logging**: Administrative changes and logins logged to the database with IP address and user-agent.
