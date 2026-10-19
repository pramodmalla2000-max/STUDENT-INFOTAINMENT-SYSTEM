import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ErrorState, EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const ParentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/parent');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load parent portal');
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
    return <LoadingSpinner size="lg" label="Connecting to Ward's Academic Profile..." className="min-h-[50vh]" />;
  }

  if (error || !data) {
    return <ErrorState title="Parent Portal Unavailable" message={error || 'No linked student record found'} onRetry={fetchDashboard} />;
  }

  const { student, metrics, results, achievements, complaints } = data;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 border border-amber-800/40 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Parent / Guardian Access Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Academic Overview: {student.personalInfo?.fullName}
            </h1>
            <p className="text-xs text-amber-200 mt-1">
              Roll: {student.rollNumber} • ID: {student.studentId} • Department: {student.academicInfo?.department?.name || student.academicInfo?.branch}
            </p>
          </div>

          <button
            onClick={() => navigate(`/student/profile/${student.studentId}`)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Inspect Child's 360° Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {metrics.isLowAttendance && (
          <div className="mt-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Attendance Warning: Student attendance has fallen below 75%. Please counsel student regarding examination eligibility.</span>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Cumulative CGPA</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.cgpa?.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Good Academic Standing</span>
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
          <span className="text-[10px] text-slate-400 mt-1 block">Mandatory 75% Cutoff</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Backlogs</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.backlogs}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Failed examinations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Year & Semester</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            Sem {student.academicInfo?.currentSemester}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Year {student.academicInfo?.yearOfStudy} (Section {student.academicInfo?.section})</span>
        </div>
      </div>

      {/* Results and Achievements Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Marks */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Semester Academic Performance</h3>
          {results && results.length > 0 ? (
            <div className="space-y-3">
              {results.map((r: any) => (
                <div
                  key={r._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Semester {r.semester} Marks
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {r.subjects?.length} Subjects Evaluated • {r.creditsEarned} Credits
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      SGPA {r.sgpa}
                    </span>
                    <Badge variant={r.status === 'PASS' ? 'success' : 'danger'} size="sm" className="ml-2">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No examination results published yet</p>
          )}
        </div>

        {/* Student Achievements */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Honors, Awards & Achievements</h3>
          {achievements && achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((ach: any) => (
                <div
                  key={ach._id}
                  className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{ach.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {ach.position} • {ach.organization} ({ach.level})
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {ach.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No extracurricular achievements logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
