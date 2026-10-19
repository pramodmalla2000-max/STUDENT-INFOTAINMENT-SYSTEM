import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Shield, School, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [collegeName, setCollegeName] = useState('Apex Institute of Technology & Science');
  const [collegeCode, setCollegeCode] = useState('AITS');
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [cgpaThreshold, setCgpaThreshold] = useState(6.5);
  const [academicYear, setAcademicYear] = useState('2025-2026');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setSettings(res.data);
          res.data.forEach((s: any) => {
            if (s.key === 'COLLEGE_NAME') setCollegeName(s.value);
            if (s.key === 'COLLEGE_CODE') setCollegeCode(s.value);
            if (s.key === 'ATTENDANCE_WARNING_THRESHOLD') setAttendanceThreshold(Number(s.value));
            if (s.key === 'CGPA_HONORS_THRESHOLD') setCgpaThreshold(Number(s.value));
            if (s.key === 'CURRENT_ACADEMIC_YEAR') setAcademicYear(s.value);
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      await Promise.all([
        api.put('/settings', { key: 'COLLEGE_NAME', value: collegeName, category: 'GENERAL' }),
        api.put('/settings', { key: 'COLLEGE_CODE', value: collegeCode, category: 'GENERAL' }),
        api.put('/settings', {
          key: 'ATTENDANCE_WARNING_THRESHOLD',
          value: Number(attendanceThreshold),
          category: 'ATTENDANCE',
        }),
        api.put('/settings', { key: 'CGPA_HONORS_THRESHOLD', value: Number(cgpaThreshold), category: 'ACADEMIC' }),
        api.put('/settings', { key: 'CURRENT_ACADEMIC_YEAR', value: academicYear, category: 'ACADEMIC' }),
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading Institutional Config..." className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Institutional Policies & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure university naming, academic session parameters, and automatic attendance cutoffs.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Institutional configurations updated and applied to student risk algorithms.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* General University Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <School className="w-4 h-4 text-indigo-500" /> College Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College / University Name
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Code
              </label>
              <input
                type="text"
                required
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Academic Cutoffs & Rules */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Academic & Attendance Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Attendance Cutoff (%)
              </label>
              <input
                type="number"
                min={50}
                max={95}
                required
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Students below this trigger alert flags</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CGPA Warning Cutoff (0.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min={4}
                max={9}
                required
                value={cgpaThreshold}
                onChange={(e) => setCgpaThreshold(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Students below this trigger low-CGPA flags</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Policies...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
