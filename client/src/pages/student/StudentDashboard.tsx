import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ErrorState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/student');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load student dashboard');
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
    return <LoadingSpinner size="lg" label="Loading Personal Academic Dashboard..." className="min-h-[50vh]" />;
  }

  if (error || !data) {
    return <ErrorState title="Dashboard Unavailable" message={error || 'Unable to retrieve records'} onRetry={fetchDashboard} />;
  }

  const { student, metrics, performanceTrend, subjectAttendance, recentResults, recentAchievements, certificates } = data;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              Semester {student.academicInfo?.currentSemester} • Section {student.academicInfo?.section}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {student.personalInfo?.firstName}!
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-lg">
              Department of {student.academicInfo?.department?.name || student.academicInfo?.branch} • ID: {student.studentId}
            </p>
          </div>

          <button
            onClick={() => navigate('/student/profile')}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span>Open Student 360° Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Low Attendance or Low CGPA Alert */}
        {(metrics.isLowAttendance || metrics.isLowCgpa) && (
          <div className="mt-6 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Attention Required:</span>{' '}
              {metrics.isLowAttendance && `Your overall attendance is ${metrics.attendance}%, below institutional mandatory 75% limit. `}
              {metrics.isLowCgpa && `Your CGPA is ${metrics.cgpa}, below academic good-standing cutoff.`}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Cumulative CGPA</span>
          <div
            className={`text-2xl font-black mt-1 ${
              metrics.isLowCgpa ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {metrics.cgpa?.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Scale 0.0 - 10.0</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Attendance Rate</span>
          <div
            className={`text-2xl font-black mt-1 ${
              metrics.isLowAttendance ? 'text-rose-500' : 'text-sky-500'
            }`}
          >
            {metrics.attendance}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Minimum: 75%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Backlogs</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.activeBacklogs}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            {metrics.creditsEarned} Credits Earned
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Profile Completion</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.profileCompletion}%
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${metrics.profileCompletion}%` }} />
          </div>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Semester-by-Semester SGPA Progression
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semester" fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[0, 10]} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="sgpa" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-Wise Attendance Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Subject Attendance Rates
            </h3>
            <div className="space-y-3">
              {subjectAttendance && subjectAttendance.length > 0 ? (
                subjectAttendance.map((sub: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {sub.name}
                      </span>
                      <span className={`font-mono font-bold ${sub.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {sub.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sub.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No subject attendance sessions recorded yet</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/student/profile?tab=attendance')}
            className="w-full mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-3 border-t border-slate-100 dark:border-slate-800"
          >
            View Full Daily Log
          </button>
        </div>
      </div>

      {/* Recent Achievements & Verification */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Verified Achievements</h3>
          <button
            onClick={() => navigate('/achievements')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Submit New Achievement
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentAchievements?.map((a: any) => (
            <div key={a._id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-amber-600 uppercase">{a.category}</span>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{a.title}</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{a.position} • {a.organization}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
