import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';

// Pages
import { Login } from '../pages/Login.js';
import { AdminDashboard } from '../pages/admin/AdminDashboard.js';
import { StudentManagement } from '../pages/admin/StudentManagement.js';
import { FacultyManagement } from '../pages/admin/FacultyManagement.js';
import { AttendanceManager } from '../pages/admin/AttendanceManager.js';
import { ResultManager } from '../pages/admin/ResultManager.js';
import { ReportsPage } from '../pages/admin/ReportsPage.js';
import { AuditLogs } from '../pages/admin/AuditLogs.js';
import { AdminSettings } from '../pages/admin/AdminSettings.js';

import { StudentDashboard } from '../pages/student/StudentDashboard.js';
import { StudentProfile360 } from '../pages/student/StudentProfile360.js';
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard.js';
import { ParentDashboard } from '../pages/parent/ParentDashboard.js';

import { ComplaintsList } from '../pages/complaints/ComplaintsList.js';
import { AchievementsList } from '../pages/achievements/AchievementsList.js';
import { CertificateVerifyPage } from '../pages/certificates/CertificateVerifyPage.js';
import { NotFound } from '../pages/NotFound.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" label="Validating Session Clearance..." />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to permitted default route
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root index smart redirector
const RootRedirect: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify/certificate/:certificateNumber" element={<CertificateVerifyPage />} />

      {/* Authenticated Dashboard Core */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* Administrator Routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/students"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/faculty"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <FacultyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <AttendanceManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/results"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <ResultManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Student Specific Routes */}
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="student/profile" element={<StudentProfile360 />} />
        <Route path="student/profile/:id" element={<StudentProfile360 />} />

        {/* Faculty Specific Routes */}
        <Route
          path="faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'SUPER_ADMIN', 'ADMIN']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent Specific Routes */}
        <Route
          path="parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'SUPER_ADMIN', 'ADMIN']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Institutional Modules */}
        <Route path="complaints" element={<ComplaintsList />} />
        <Route path="achievements" element={<AchievementsList />} />
        <Route path="certificates" element={<StudentProfile360 />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
