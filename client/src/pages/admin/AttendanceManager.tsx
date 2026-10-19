import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, Check, X, Clock, ShieldAlert, Filter } from 'lucide-react';
import { api } from '../../api/client.js';
import { Student, Subject } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const AttendanceManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'OD'>>({});
  const [remarksSheet, setRemarksSheet] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [subRes, stuRes] = await Promise.all([
          api.get('/academic/subjects'),
          api.get('/students?limit=50'),
        ]);

        if (subRes.success && subRes.data) {
          setSubjects(subRes.data);
          if (subRes.data.length > 0) setSelectedSubject(subRes.data[0]._id);
        }

        if (stuRes.success && stuRes.data) {
          setStudents(stuRes.data);
          const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'OD'> = {};
          stuRes.data.forEach((s: Student) => {
            initialMap[s._id] = 'PRESENT';
          });
          setAttendanceSheet(initialMap);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'OD') => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'OD'> = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const records = students.map((s) => ({
        student: s._id,
        status: attendanceSheet[s._id] || 'PRESENT',
        remarks: remarksSheet[s._id] || '',
      }));

      const res = await api.post('/attendance/bulk', {
        subject: selectedSubject,
        date: selectedDate,
        semester: 3,
        academicYear: '2025-2026',
        records,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to save attendance roster');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading Class Roster..." className="min-h-[50vh]" />;
  }

  const presentCount = Object.values(attendanceSheet).filter((s) => s === 'PRESENT' || s === 'OD').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance Command Sheet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bulk register subject classroom attendance, on-duty approvals, and track percentage cutoffs.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Submitting Records...' : 'Save & Submit Attendance'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Attendance records successfully written to database and student percentages recalculated.</span>
        </div>
      )}

      {/* Control Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">
            Present: <strong className="text-emerald-600 font-mono">{presentCount}</strong> / {students.length}
          </span>
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Roster Sheet Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-800/40">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Historical Attendance</th>
              <th className="py-3 px-4 text-center">Status For This Session</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {students.map((student) => {
              const currentStatus = attendanceSheet[student._id] || 'PRESENT';
              return (
                <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{student.personalInfo?.fullName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{student.studentId}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {student.rollNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold ${student.overallAttendancePercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {student.overallAttendancePercentage}%
                    </span>
                    {student.overallAttendancePercentage < 75 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'PRESENT')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'ABSENT')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'LATE')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        L
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'OD')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          currentStatus === 'OD'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        OD
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="Optional remark..."
                      value={remarksSheet[student._id] || ''}
                      onChange={(e) =>
                        setRemarksSheet({ ...remarksSheet, [student._id]: e.target.value })
                      }
                      className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent w-full max-w-xs"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
