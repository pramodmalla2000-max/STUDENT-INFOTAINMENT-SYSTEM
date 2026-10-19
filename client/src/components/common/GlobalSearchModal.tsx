import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, BookOpen, Award, AlertCircle, X, ChevronRight, GraduationCap } from 'lucide-react';
import { api } from '../../api/client.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    students: [],
    faculty: [],
    departments: [],
    achievements: [],
    complaints: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ students: [], faculty: [], departments: [], achievements: [], complaints: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ students: [], faculty: [], departments: [], achievements: [], complaints: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalResults =
    (results.students?.length || 0) +
    (results.faculty?.length || 0) +
    (results.departments?.length || 0) +
    (results.achievements?.length || 0) +
    (results.complaints?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students (e.g. 25B21AI024, Sai), faculty, departments, achievements..."
            className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {isLoading && (
            <div className="py-8 text-center text-sm text-slate-400">Searching records...</div>
          )}

          {!isLoading && query.length >= 2 && totalResults === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No institutional records found matching &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Students Results */}
          {results.students && results.students.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Students (Click to open 360° Profile)
              </div>
              <div className="space-y-1">
                {results.students.map((student: any) => (
                  <button
                    key={student._id}
                    onClick={() => {
                      onClose();
                      navigate(`/student/profile/${student.studentId || student._id}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                        {student.studentId?.slice(-3) || 'STU'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {student.personalInfo?.fullName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                            {student.studentId}
                          </span>
                          <span>•</span>
                          <span>{student.academicInfo?.department?.name || student.academicInfo?.branch}</span>
                          <span>•</span>
                          <span>Year {student.academicInfo?.yearOfStudy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        CGPA {student.currentCgpa}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Results */}
          {results.faculty && results.faculty.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" /> Faculty
              </div>
              <div className="space-y-1">
                {results.faculty.map((f: any) => (
                  <div
                    key={f._id}
                    className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {f.user?.name || f.employeeId}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {f.designation} • {f.department?.name} ({f.employeeId})
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{f.cabinNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {results.departments && results.departments.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Departments
              </div>
              <div className="grid grid-cols-2 gap-2">
                {results.departments.map((dept: any) => (
                  <div
                    key={dept._id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{dept.code}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{dept.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {results.achievements && results.achievements.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Achievements
              </div>
              <div className="space-y-1">
                {results.achievements.map((ach: any) => (
                  <div
                    key={ach._id}
                    className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{ach.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ach.organization} • Student: {ach.student?.personalInfo?.fullName} ({ach.student?.studentId})
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">{ach.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-4">
          <span>ProTip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">Ctrl+K</kbd> anywhere to open search</span>
          <span>{totalResults} matching results</span>
        </div>
      </div>
    </div>
  );
};
