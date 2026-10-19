import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Check, Award, Save } from 'lucide-react';
import { api } from '../../api/client.js';
import { Student, Subject } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const ResultManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [semester, setSemester] = useState(3);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Subject marks input state
  const [marksList, setMarksList] = useState<
    { subjectId: string; internalMarks: number; externalMarks: number; maxMarks: number }[]
  >([]);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [stuRes, subRes] = await Promise.all([
          api.get('/students?limit=50'),
          api.get('/academic/subjects'),
        ]);

        if (stuRes.success && stuRes.data) {
          setStudents(stuRes.data);
          if (stuRes.data.length > 0) setSelectedStudent(stuRes.data[0]._id);
        }

        if (subRes.success && subRes.data) {
          setSubjects(subRes.data);
          setMarksList(
            subRes.data.slice(0, 4).map((s: Subject) => ({
              subjectId: s._id,
              internalMarks: 35,
              externalMarks: 50,
              maxMarks: 100,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInit();
  }, []);

  const handlePublishResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || marksList.length === 0) return;
    setIsPublishing(true);
    setSuccessMessage('');

    try {
      const payload = {
        student: selectedStudent,
        semester: Number(semester),
        academicYear,
        subjects: marksList.map((m) => {
          const sub = subjects.find((s) => s._id === m.subjectId);
          return {
            subject: m.subjectId,
            subjectCode: sub?.code || 'SUB',
            subjectName: sub?.name || 'Subject',
            internalMarks: Number(m.internalMarks),
            externalMarks: Number(m.externalMarks),
            maxMarks: Number(m.maxMarks),
            credits: sub?.credits || 3,
          };
        }),
      };

      const res = await api.post('/results', payload);
      if (res.success) {
        setSuccessMessage('Semester examination result declared, SGPA computed, and student/parent notified.');
        setTimeout(() => setSuccessMessage(false as any), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading Examination Matrix..." className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Examination & Grade Administration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter internal assessments and university external marks to compute SGPA and CGPA.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handlePublishResults} className="space-y-6">
        {/* Selector Header */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} - {s.personalInfo?.fullName} (Roll: {s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Subjects Marks Breakdown Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum Subjects Assessment</h3>
            <span className="text-xs text-slate-400">Total subjects: {marksList.length}</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Internal (Max 40)</th>
                <th className="py-3 px-4 text-center">External (Max 60)</th>
                <th className="py-3 px-4 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {marksList.map((item, idx) => {
                const sub = subjects.find((s) => s._id === item.subjectId);
                const total = Number(item.internalMarks) + Number(item.externalMarks);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{sub?.name || 'Subject'}</span>
                      <span className="text-[11px] text-indigo-600 font-mono">{sub?.code} • {sub?.credits} Credits</span>
                    </td>
                    <td className="py-3 px-4 text-center">{item.maxMarks}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={item.internalMarks}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...marksList];
                          updated[idx].internalMarks = val;
                          setMarksList(updated);
                        }}
                        className="w-20 text-center text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-bold"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={item.externalMarks}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...marksList];
                          updated[idx].externalMarks = val;
                          setMarksList(updated);
                        }}
                        className="w-20 text-center text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-bold"
                      />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                      {total} / 100
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPublishing}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isPublishing ? 'Calculating & Publishing...' : 'Declare & Publish Semester Results'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
