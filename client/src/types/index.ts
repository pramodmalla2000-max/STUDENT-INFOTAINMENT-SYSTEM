export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  studentId?: string;
  facultyId?: string;
  parentId?: string;
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  degree: string;
  department: Department | string;
  durationYears: number;
  totalSemesters: number;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: Department | string;
  course: Course | string;
  semester: number;
  credits: number;
  type: 'THEORY' | 'LAB' | 'ELECTIVE' | 'PROJECT';
}

export interface StudentPersonal {
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photo?: string;
}

export interface StudentAcademic {
  department: Department;
  course: Course;
  branch: string;
  batch: string;
  academicYear: string;
  currentSemester: number;
  section: string;
  yearOfStudy: number;
  admissionDate: string;
  graduationExpectedDate?: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'DROPPED';
}

export interface StudentParentInfo {
  fatherName: string;
  motherName: string;
  guardianName?: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  relationship: string;
}

export interface StudentPlacement {
  status: 'UNPLACED' | 'PLACED' | 'OPTED_OUT' | 'HIGHER_STUDIES' | 'ENTREPRENEUR';
  company?: string;
  packageLPA?: number;
  role?: string;
  placementDate?: string;
  internshipCompany?: string;
  internshipStipend?: number;
}

export interface Student {
  _id: string;
  studentId: string;
  rollNumber: string;
  admissionNumber: string;
  user: User | string;
  personalInfo: StudentPersonal;
  academicInfo: StudentAcademic;
  parentInfo: StudentParentInfo;
  placementInfo: StudentPlacement;
  currentCgpa: number;
  totalCreditsEarned: number;
  activeBacklogs: number;
  overallAttendancePercentage: number;
  profileCompletionPercentage: number;
  remarks?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  student: Student | string;
  subject: Subject | string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'OD';
  semester: number;
  academicYear: string;
  remarks?: string;
}

export interface SubjectResult {
  subject: Subject | string;
  subjectCode: string;
  subjectName: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  gradePoint: number;
  credits: number;
  status: 'PASS' | 'FAIL' | 'ABSENT';
}

export interface ResultRecord {
  _id: string;
  student: Student | string;
  semester: number;
  academicYear: string;
  subjects: SubjectResult[];
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  creditsEarned: number;
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  status: 'PASS' | 'FAIL';
  declaredDate: string;
  remarks?: string;
}

export interface Achievement {
  _id: string;
  student: Student | string;
  title: string;
  category: string;
  description: string;
  achievementDate: string;
  organization: string;
  level: string;
  position: string;
  documentUrl?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationRemarks?: string;
  verifiedBy?: User | string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Certificate {
  _id: string;
  student: Student | string;
  certificateNumber: string;
  title: string;
  category: string;
  issueDate: string;
  issuingOrganization: string;
  documentUrl?: string;
  verificationUrl?: string;
  status: 'VERIFIED' | 'PENDING' | 'INVALID';
}

export interface ComplaintHistory {
  status: string;
  comment: string;
  updatedBy?: { name: string; role: string };
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  student: Student | string;
  title: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  attachments?: string[];
  assignedTo?: User;
  resolution?: string;
  resolvedAt?: string;
  history?: ComplaintHistory[];
  createdAt: string;
}

export interface DocumentRecord {
  _id: string;
  student: string;
  title: string;
  fileName: string;
  fileUrl: string;
  type: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  timestamp: string;
  details?: any;
}
