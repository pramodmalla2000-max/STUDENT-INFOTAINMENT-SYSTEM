import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  MessageSquareWarning,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ErrorState } from '../../components/common/EmptyState.js';

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/faculty');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load faculty portal');
      }
    } catch (e: any) {
      setError(e.message || 'Error communicating with server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading Faculty Instructional Workspace..." className="min-h-[50vh]" />;
  }

  if (error || !data) {
    return <ErrorState title="Faculty Portal Unavailable" message={error || 'Unable to retrieve workspace'} onRetry={fetchDashboard} />;
  }

  const { faculty, metrics } = data;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 border border-emerald-800/40 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
              {faculty?.designation || 'Faculty Member'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
              Welcome, {faculty?.user?.name || faculty?.employeeId}!
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Department: {faculty?.department?.name} • Cabin: {faculty?.cabinNumber} • Employee ID: {faculty?.employeeId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/attendance')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark Today's Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Enrolled Students</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.studentsCount}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">In your department</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Assigned Classes</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.assignedClassesCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active timetable</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Pending Approvals</span>
          <div className="text-2xl font-black text-amber-500 mt-1">{metrics.pendingAchievements}</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Achievements to verify</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Open Grievances</span>
          <div className="text-2xl font-black text-rose-500 mt-1">{metrics.openComplaints}</div>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Requiring review</span>
        </div>
      </div>

      {/* Assigned Classes Roster List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Instructional Classes & Subjects</h3>
          <button
            onClick={() => navigate('/admin/attendance')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            Open Attendance Sheet <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faculty?.assignedClasses?.map((cls: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  {cls.subject?.name || 'Class Subject'}
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                  {cls.subject?.code} • Semester {cls.semester} (Section {cls.section})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/attendance')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Mark
                </button>
                <button
                  onClick={() => navigate('/admin/results')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
                >
                  Grades
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
