import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  FileCheck,
  MessageSquareWarning,
  Files,
  Briefcase,
  FileText,
  History,
  Settings,
  BookOpen,
  UserCheck,
  Building2,
  ChevronLeft,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'STUDENT';

  // Define navigation items customized per role
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Students', path: '/admin/students', icon: GraduationCap },
          { label: 'Faculty', path: '/admin/faculty', icon: Users },
          { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
          { label: 'Results & Marks', path: '/admin/results', icon: FileSpreadsheet },
          { label: 'Achievements', path: '/achievements', icon: Award },
          { label: 'Certificates', path: '/certificates', icon: FileCheck },
          { label: 'Grievances', path: '/complaints', icon: MessageSquareWarning },
          { label: 'Reports & Export', path: '/admin/reports', icon: FileText },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
          { label: 'College Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'FACULTY':
        return [
          { label: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
          { label: 'Students Roster', path: '/admin/students', icon: GraduationCap },
          { label: 'Mark Attendance', path: '/admin/attendance', icon: CalendarCheck },
          { label: 'Enter Results', path: '/admin/results', icon: FileSpreadsheet },
          { label: 'Student Achievements', path: '/achievements', icon: Award },
          { label: 'Student Grievances', path: '/complaints', icon: MessageSquareWarning },
        ];
      case 'STUDENT':
        return [
          { label: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'Student 360° Profile', path: '/student/profile', icon: GraduationCap },
          { label: 'My Attendance', path: '/student/profile?tab=attendance', icon: CalendarCheck },
          { label: 'My Results', path: '/student/profile?tab=results', icon: FileSpreadsheet },
          { label: 'My Achievements', path: '/student/profile?tab=achievements', icon: Award },
          { label: 'Certificates', path: '/student/profile?tab=certificates', icon: FileCheck },
          { label: 'Submit Grievance', path: '/complaints', icon: MessageSquareWarning },
          { label: 'Documents Vault', path: '/student/profile?tab=documents', icon: Files },
          { label: 'Placement Status', path: '/student/profile?tab=placement', icon: Briefcase },
        ];
      case 'PARENT':
        return [
          { label: 'Parent Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
          { label: "Child's 360° Profile", path: '/student/profile', icon: GraduationCap },
          { label: 'Attendance Record', path: '/student/profile?tab=attendance', icon: CalendarCheck },
          { label: 'Academic Results', path: '/student/profile?tab=results', icon: FileSpreadsheet },
          { label: 'Student Achievements', path: '/student/profile?tab=achievements', icon: Award },
          { label: 'Grievance Tracking', path: '/complaints', icon: MessageSquareWarning },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                STUDENT 360°
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                Infotainment System
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && (
        <div className="px-4 py-2 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-100/60 dark:border-indigo-900/20 flex items-center justify-between">
          <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
            {role.replace('_', ' ')} PORTAL
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile / Quick Signout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 z-40 flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-white dark:bg-slate-900 z-50 shadow-2xl animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
