import mongoose, { Document, Schema, Model } from 'mongoose';

export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'DROPPED';
export type PlacementStatus = 'UNPLACED' | 'PLACED' | 'OPTED_OUT' | 'HIGHER_STUDIES' | 'ENTREPRENEUR';

export interface IStudentPersonal {
  firstName: string;
  lastName: string;
  fullName: string;
  dob: Date;
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

export interface IStudentAcademic {
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  branch: string;
  batch: string; // e.g., '2023-2027'
  academicYear: string; // e.g., '2025-2026'
  currentSemester: number;
  section: string; // e.g., 'A'
  yearOfStudy: number; // 1, 2, 3, 4
  admissionDate: Date;
  graduationExpectedDate: Date;
  status: StudentStatus;
}

export interface IStudentParentInfo {
  fatherName: string;
  motherName: string;
  guardianName?: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  relationship: string;
}

export interface IStudentPlacement {
  status: PlacementStatus;
  company?: string;
  packageLPA?: number;
  role?: string;
  placementDate?: Date;
  internshipCompany?: string;
  internshipStipend?: number;
  offerLetterUrl?: string;
}

export interface IStudent extends Document {
  studentId: string; // e.g. 23B21AI024
  rollNumber: string; // e.g. 23B21AI024
  admissionNumber: string; // e.g. ADM-2023-0142
  user: mongoose.Types.ObjectId;
  parentUser?: mongoose.Types.ObjectId;
  personalInfo: IStudentPersonal;
  academicInfo: IStudentAcademic;
  parentInfo: IStudentParentInfo;
  placementInfo: IStudentPlacement;
  currentCgpa: number;
  totalCreditsEarned: number;
  activeBacklogs: number;
  overallAttendancePercentage: number;
  profileCompletionPercentage: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    admissionNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentUser: { type: Schema.Types.ObjectId, ref: 'User' },
    personalInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      fullName: { type: String, required: true, trim: true, index: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
      bloodGroup: { type: String, default: 'O+' },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true, index: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      photo: { type: String, default: '' },
    },
    academicInfo: {
      department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
      course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
      branch: { type: String, required: true },
      batch: { type: String, required: true, index: true },
      academicYear: { type: String, required: true, index: true },
      currentSemester: { type: Number, required: true, min: 1, max: 12, index: true },
      section: { type: String, required: true, uppercase: true, default: 'A', index: true },
      yearOfStudy: { type: Number, required: true, min: 1, max: 6 },
      admissionDate: { type: Date, default: Date.now },
      graduationExpectedDate: { type: Date },
      status: {
        type: String,
        enum: ['ACTIVE', 'GRADUATED', 'SUSPENDED', 'DROPPED'],
        default: 'ACTIVE',
        index: true,
      },
    },
    parentInfo: {
      fatherName: { type: String, required: true, trim: true },
      motherName: { type: String, required: true, trim: true },
      guardianName: { type: String, default: '' },
      parentEmail: { type: String, required: true, lowercase: true, trim: true },
      parentPhone: { type: String, required: true, trim: true },
      emergencyContact: { type: String, required: true },
      relationship: { type: String, default: 'Father' },
    },
    placementInfo: {
      status: {
        type: String,
        enum: ['UNPLACED', 'PLACED', 'OPTED_OUT', 'HIGHER_STUDIES', 'ENTREPRENEUR'],
        default: 'UNPLACED',
      },
      company: { type: String, default: '' },
      packageLPA: { type: Number, default: 0 },
      role: { type: String, default: '' },
      placementDate: { type: Date },
      internshipCompany: { type: String, default: '' },
      internshipStipend: { type: Number, default: 0 },
      offerLetterUrl: { type: String, default: '' },
    },
    currentCgpa: { type: Number, default: 0, min: 0, max: 10, index: true },
    totalCreditsEarned: { type: Number, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    overallAttendancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    profileCompletionPercentage: { type: Number, default: 90, min: 0, max: 100 },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound indexes for lightning-fast search and filtering
StudentSchema.index({
  'personalInfo.fullName': 'text',
  studentId: 'text',
  rollNumber: 'text',
  'personalInfo.email': 'text',
});

export const Student: Model<IStudent> = mongoose.model<IStudent>('Student', StudentSchema);
