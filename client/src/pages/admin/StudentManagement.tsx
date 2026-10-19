import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Student, Department } from '../../types/index.js';
import { LoadingSpinner, TableSkeleton } from '../../components/common/LoadingSpinner.js';
import { EmptyState, ErrorState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const StudentManagement: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    rollNumber: '',
    department: '',
    currentSemester: 1,
    yearOfStudy: 1,
    section: 'A',
    gender: 'MALE',
    fatherName: '',
    motherName: '',
    parentEmail: '',
    parentPhone: '',
    address: 'Campus Hostel Block B',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    currentCgpa: 8.0,
    overallAttendancePercentage: 85,
  });

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/academic/departments');
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (selectedDept) params.append('department', selectedDept);
      if (selectedYear) params.append('year', selectedYear);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.success && res.data) {
        setStudents(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error loading student directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, selectedDept, selectedYear, selectedStatus, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchStudents();
  };

  const handleExportCsv = () => {
    window.open('/api/reports/students?format=csv', '_blank');
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        studentId: newStudent.studentId || undefined,
        rollNumber: newStudent.rollNumber || newStudent.studentId || undefined,
        personalInfo: {
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email,
          phone: newStudent.phone,
          dob: new Date('2005-01-01'),
          gender: newStudent.gender,
          address: newStudent.address,
          city: newStudent.city,
          state: newStudent.state,
          pincode: newStudent.pincode,
        },
        academicInfo: {
          department: newStudent.department || departments[0]?._id,
          branch: departments.find((d) => d._id === newStudent.department)?.name || 'Computer Science',
          batch: '2025-2029',
          academicYear: '2025-2026',
          currentSemester: Number(newStudent.currentSemester),
          yearOfStudy: Number(newStudent.yearOfStudy),
          section: newStudent.section,
          status: 'ACTIVE',
        },
        parentInfo: {
          fatherName: newStudent.fatherName,
          motherName: newStudent.motherName,
          parentEmail: newStudent.parentEmail || `parent.${newStudent.email}`,
          parentPhone: newStudent.parentPhone || newStudent.phone,
          emergencyContact: newStudent.parentPhone || newStudent.phone,
          relationship: 'Father',
        },
        currentCgpa: Number(newStudent.currentCgpa),
        overallAttendancePercentage: Number(newStudent.overallAttendancePercentage),
      };

      const res = await api.post('/students', payload);
      if (res.success) {
        setIsAddModalOpen(false);
        await fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create student profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStudentStatus = async (studentId: string) => {
    try {
      await api.delete(`/students/${studentId}`);
      await fetchStudents();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Information Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, enroll and inspect centralized Student 360° digital records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV Report
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID (e.g. 25B21AI024), roll number or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="GRADUATED">Graduated</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DROPPED">Dropped</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="createdAt">Date Enrolled</option>
              <option value="name">Full Name</option>
              <option value="rollNumber">Roll Number</option>
              <option value="cgpa">CGPA</option>
              <option value="attendance">Attendance</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStudents} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No Students Found"
            description="No student records match the active filters or search terms."
            action={{ label: 'Reset Search', onClick: () => { setSearch(''); setSelectedDept(''); setSelectedStatus(''); fetchStudents(); } }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID / Roll</th>
                  <th className="py-3 px-4">Department & Class</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Placement</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {students.map((student) => {
                  const isLowAttd = student.overallAttendancePercentage < 75;
                  const isLowCgpa = student.currentCgpa < 6.5;

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/student/profile/${student.studentId || student._id}`)}
                    >
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student.personalInfo?.photo ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.personalInfo?.firstName}`
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {student.personalInfo?.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{student.personalInfo?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* IDs */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{student.studentId}</span>
                        <span className="text-[10px] text-slate-400">Roll: {student.rollNumber}</span>
                      </td>

                      {/* Academic */}
                      <td className="py-3 px-4">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold block">
                          {(student.academicInfo?.department as any)?.code || student.academicInfo?.branch}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Year {student.academicInfo?.yearOfStudy} (Sem {student.academicInfo?.currentSemester}-{student.academicInfo?.section})
                        </span>
                      </td>

                      {/* CGPA */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isLowCgpa ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {student.currentCgpa?.toFixed(2)}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isLowAttd ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {student.overallAttendancePercentage}%
                        </span>
                      </td>

                      {/* Placement */}
                      <td className="py-3 px-4 text-center">
                        {student.placementInfo?.status === 'PLACED' ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {student.placementInfo?.company} ({student.placementInfo?.packageLPA} LPA)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unplaced</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={student.academicInfo?.status === 'ACTIVE' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {student.academicInfo?.status}
                        </Badge>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/student/profile/${student.studentId || student._id}`)}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            title="Open 360° Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(student._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Toggle Active/Dropped Status"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enroll Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Enroll New Student Profile</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student University ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 26B21AI099"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 26B21AI099"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Email</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year of Study</label>
                  <select
                    value={newStudent.yearOfStudy}
                    onChange={(e) => setNewStudent({ ...newStudent, yearOfStudy: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newStudent.currentSemester}
                    onChange={(e) => setNewStudent({ ...newStudent, currentSemester: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
