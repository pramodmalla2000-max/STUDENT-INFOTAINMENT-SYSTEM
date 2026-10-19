import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Award,
  FileCheck,
  MessageSquareWarning,
  Files,
  Briefcase,
  AlertOctagon,
  Clock,
  User,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ErrorState, EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';

export const StudentProfile360: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // If no param is in URL, use logged-in student's studentId
  const targetId = id || user?.studentId;

  const currentTab = searchParams.get('tab') || 'overview';

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload document modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('MARKSHEET');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProfile = async () => {
    if (!targetId) {
      setError('Student ID missing or not accessible');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/students/${targetId}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load Student 360 profile');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching 360 profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !data?.student?._id) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('studentId', data.student._id);
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('type', uploadType);

      const res = await api.post('/documents/upload', formData);
      if (res.success) {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setUploadTitle('');
        await fetchProfile();
      }
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Aggregating 360° Institutional Student Data..." className="min-h-[50vh]" />;
  }

  if (error || !data?.student) {
    return <ErrorState title="Unable to retrieve Student 360 Profile" message={error || 'Profile not found'} onRetry={fetchProfile} />;
  }

  const { student, stats, results, achievements, certificates, complaints, documents, disciplinaryRecords, timeline } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'results', label: 'Results & Marks', icon: FileCheck },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'certificates', label: 'Certificates', icon: FileCheck },
    { id: 'complaints', label: 'Grievances', icon: MessageSquareWarning },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'discipline', label: 'Discipline', icon: AlertOctagon },
    { id: 'timeline', label: 'Activity Timeline', icon: Clock },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 360 Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={
                  student.personalInfo?.photo ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.personalInfo?.firstName}`
                }
                alt={student.personalInfo?.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-800 border-2 border-indigo-400/40 shadow-lg"
              />
              <span
                className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  student.academicInfo?.status === 'ACTIVE'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {student.academicInfo?.status}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {student.personalInfo?.fullName}
                </h1>
                <Badge variant="primary" size="sm">
                  {student.studentId}
                </Badge>
              </div>

              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium mb-3">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  {student.academicInfo?.department?.name || student.academicInfo?.branch}
                </span>
                <span>•</span>
                <span>{student.academicInfo?.course?.code || student.academicInfo?.course?.name}</span>
                <span>•</span>
                <span>Year {student.academicInfo?.yearOfStudy} (Sem {student.academicInfo?.currentSemester} - Sec {student.academicInfo?.section})</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md font-mono text-slate-200">
                  Roll: {student.rollNumber}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md font-mono text-slate-200">
                  Batch: {student.academicInfo?.batch}
                </span>
                {student.placementInfo?.status === 'PLACED' && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Placed: {student.placementInfo?.company} ({student.placementInfo?.packageLPA} LPA)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Academic Metric Pills */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
            <div className="text-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[90px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">CGPA</span>
              <span
                className={`text-2xl font-black ${
                  stats.isLowCgpa ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {student.currentCgpa?.toFixed(2)}
              </span>
            </div>

            <div className="text-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[90px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Attendance</span>
              <span
                className={`text-2xl font-black ${
                  stats.isLowAttendance ? 'text-rose-400' : 'text-sky-400'
                }`}
              >
                {stats.attendancePercentage}%
              </span>
            </div>

            <div className="text-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[90px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Backlogs</span>
              <span
                className={`text-2xl font-black ${
                  student.activeBacklogs > 0 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {student.activeBacklogs}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance or Low CGPA Alert Banner */}
        {(stats.isLowAttendance || stats.isLowCgpa) && (
          <div className="mt-5 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Academic Warning Flag:</span>{' '}
              {stats.isLowAttendance && `Attendance (${stats.attendancePercentage}%) is below institutional mandatory 75% cutoff. `}
              {stats.isLowCgpa && `CGPA (${student.currentCgpa}) is below academic threshold 6.5.`}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tab Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Credits Earned</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {student.totalCreditsEarned} Credits
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 inline-block">
                On track for graduation
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Attended Classes</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.presentCount + stats.odCount} / {stats.totalClasses}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 inline-block">
                {stats.absentCount} Absent, {stats.lateCount} Late
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recognitions & Awards</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {achievements?.length || 0} Recorded
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 inline-block">
                {achievements?.filter((a: any) => a.verificationStatus === 'VERIFIED').length} Verified
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Profile Completion</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {student.profileCompletionPercentage}%
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${student.profileCompletionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Academic Highlights & Recent Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Semester Grades Snapshot */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Recent Semester Performance</span>
                <button onClick={() => setTab('results')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  View Full History
                </button>
              </h3>
              {results && results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(-3).map((r: any) => (
                    <div
                      key={r._id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Semester {r.semester}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Academic Year {r.academicYear} • {r.subjects?.length} Subjects
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          SGPA {r.sgpa}
                        </span>
                        <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No examination results published yet</p>
              )}
            </div>

            {/* Quick Achievements Snapshot */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Verified Achievements & Competitions</span>
                <button onClick={() => setTab('achievements')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All ({achievements?.length})
                </button>
              </h3>
              {achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((a: any) => (
                    <div
                      key={a._id}
                      className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
                    >
                      <div className="max-w-xs">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {a.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {a.position} • {a.organization} ({a.level})
                        </p>
                      </div>
                      <Badge variant={a.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                        {a.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No student achievements logged</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PERSONAL */}
      {currentTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Basic Demographics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Full Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.personalInfo?.dob ? new Date(student.personalInfo.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Blood Group</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Primary Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Primary Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.phone}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> Permanent Residential Address
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Street Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.address}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">City</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">State</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Pincode</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.personalInfo?.pincode}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Parent / Guardian Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Father's Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.fatherName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Mother's Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.motherName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Parent Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.parentEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Parent Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.parentPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.emergencyContact}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Relationship</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parentInfo?.relationship || 'Parent'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ACADEMIC */}
      {currentTab === 'academic' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Academic Enrollment & Program Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Student University ID</span>
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{student.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Roll Number</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Admission Registration #</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{student.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Department</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {student.academicInfo?.department?.name} ({student.academicInfo?.department?.code})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Degree & Course</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {student.academicInfo?.course?.name} ({student.academicInfo?.course?.code})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Branch / Specialization</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.academicInfo?.branch}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Academic Year & Batch</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {student.academicInfo?.academicYear} (Batch {student.academicInfo?.batch})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Semester & Section</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Semester {student.academicInfo?.currentSemester} - Section {student.academicInfo?.section} (Year {student.academicInfo?.yearOfStudy})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Admission Date</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {student.academicInfo?.admissionDate ? new Date(student.academicInfo.admissionDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: ATTENDANCE */}
      {currentTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Total Classes Conducted</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClasses}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Present Sessions</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.presentCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Absent Sessions</span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.absentCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">On-Duty / Approved Late</span>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.odCount + stats.lateCount}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Institutional Attendance Compliance</h3>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Overall Attendance: {stats.attendancePercentage}%
              </span>
              <span className="text-slate-400">Mandatory Cutoff: 75%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stats.isLowAttendance ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: RESULTS */}
      {currentTab === 'results' && (
        <div className="space-y-6">
          {results && results.length > 0 ? (
            results.map((r: any) => (
              <div key={r._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Semester {r.semester} Examination Marksheet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Academic Year: {r.academicYear} • Declared on {new Date(r.declaredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">SGPA</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">{r.sgpa}</span>
                    </div>
                    <Badge variant={r.status === 'PASS' ? 'success' : 'danger'} size="md">
                      {r.status}
                    </Badge>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-3 text-center">Internal</th>
                        <th className="py-2.5 px-3 text-center">External</th>
                        <th className="py-2.5 px-3 text-center">Total</th>
                        <th className="py-2.5 px-3 text-center">Grade</th>
                        <th className="py-2.5 px-3 text-center">Credits</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {r.subjects?.map((sub: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.subjectCode}</td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{sub.subjectName}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{sub.internalMarks}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{sub.externalMarks}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">{sub.totalMarks} / {sub.maxMarks}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">{sub.grade}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{sub.credits}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={sub.status === 'PASS' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No Results Declared" description="Semester examinations results have not yet been published for this student profile." />
          )}
        </div>
      )}

      {/* Tab 6: ACHIEVEMENTS */}
      {currentTab === 'achievements' && (
        <div className="space-y-4">
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach: any) => (
                <div key={ach._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {ach.category}
                      </span>
                      <Badge variant={ach.verificationStatus === 'VERIFIED' ? 'success' : ach.verificationStatus === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                        {ach.verificationStatus}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{ach.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{ach.description}</p>
                  </div>
                  <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                    <span>{ach.organization} • {ach.level}</span>
                    <span>{new Date(ach.achievementDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Achievements Logged" description="Student has not yet registered hackathons, papers, or sports achievements." />
          )}
        </div>
      )}

      {/* Tab 7: CERTIFICATES */}
      {currentTab === 'certificates' && (
        <div className="space-y-4">
          {certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any) => (
                <div key={cert._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        #{cert.certificateNumber}
                      </span>
                      <Badge variant="success" size="sm">VERIFIED</Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{cert.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Issuing Body: {cert.issuingOrganization} • Issued on {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={`/verify/certificate/${cert.certificateNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Public Verifier Link
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Certificates on Record" description="No verified credentials logged for this student." />
          )}
        </div>
      )}

      {/* Tab 8: COMPLAINTS */}
      {currentTab === 'complaints' && (
        <div className="space-y-4">
          {complaints && complaints.length > 0 ? (
            complaints.map((c: any) => (
              <div key={c._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{c.category} Grievance</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.priority === 'HIGH' || c.priority === 'URGENT' ? 'danger' : 'neutral'} size="sm">
                      {c.priority} PRIORITY
                    </Badge>
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{c.description}</p>
                {c.resolution && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold">Official Resolution:</span> {c.resolution}
                  </div>
                )}
              </div>
            ))
          ) : (
            <EmptyState title="No Grievances Logged" description="Student has no active or historical complaint tickets." />
          )}
        </div>
      )}

      {/* Tab 9: DOCUMENTS */}
      {currentTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Verified Academic Documents Vault</h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>

          {documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <div key={doc._id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {doc.type}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{doc.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{doc.fileName}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> View/Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Documents Uploaded"
              description="Marksheets, ID proof, or bonafide certificates have not yet been stored."
              action={{ label: 'Upload Document', onClick: () => setIsUploadModalOpen(true) }}
            />
          )}
        </div>
      )}

      {/* Tab 10: PLACEMENT */}
      {currentTab === 'placement' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Career & Placement Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Training & Placement Cell (T&P) verification</p>
            </div>
            <Badge variant={student.placementInfo?.status === 'PLACED' ? 'success' : 'neutral'} size="md">
              {student.placementInfo?.status || 'UNPLACED'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Company Offer</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{student.placementInfo?.company || 'None recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Package Offered (CTC)</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {student.placementInfo?.packageLPA ? `${student.placementInfo.packageLPA} LPA` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Designation / Role</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{student.placementInfo?.role || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Internship Sponsor</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{student.placementInfo?.internshipCompany || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Monthly Stipend</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {student.placementInfo?.internshipStipend ? `₹${student.placementInfo.internshipStipend.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: DISCIPLINE */}
      {currentTab === 'discipline' && (
        <div className="space-y-4">
          {disciplinaryRecords && disciplinaryRecords.length > 0 ? (
            disciplinaryRecords.map((d: any) => (
              <div key={d._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">{d.incident}</h4>
                  <Badge variant={d.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">{d.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{d.description}</p>
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl font-medium">
                  <span className="font-bold">Action Taken:</span> {d.actionTaken}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Clean Institutional Record</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">This student has zero adverse disciplinary incidents recorded.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 12: ACTIVITY TIMELINE */}
      {currentTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Unified Student 360° Activity Timeline</h3>
          {timeline && timeline.length > 0 ? (
            <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-4 space-y-6">
              {timeline.map((event: any, idx: number) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                  <div className="text-xs font-semibold text-slate-400 mb-0.5">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.subtitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Activity Events" description="There is no historical activity recorded for this student yet." />
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upload Student Document</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. 10th Standard Marksheet / Bonafide"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="MARKSHEET">Marksheet</option>
                  <option value="ID_PROOF">ID Proof / Aadhaar</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="BONAFIDE">Bonafide Certificate</option>
                  <option value="TRANSFER_CERTIFICATE">Transfer Certificate</option>
                  <option value="INTERNSHIP">Internship Offer / Completion</option>
                  <option value="OTHER">Other Academic File</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">File (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
