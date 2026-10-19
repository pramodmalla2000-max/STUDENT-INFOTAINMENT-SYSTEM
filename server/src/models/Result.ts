import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISubjectResult {
  subject: mongoose.Types.ObjectId;
  subjectCode: string;
  subjectName: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string; // 'O', 'A+', 'A', 'B+', 'B', 'C', 'F'
  gradePoint: number; // 10, 9, 8, 7, 6, 5, 0
  credits: number;
  status: 'PASS' | 'FAIL' | 'ABSENT';
}

export interface IResult extends Document {
  student: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  subjects: ISubjectResult[];
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  creditsEarned: number;
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  status: 'PASS' | 'FAIL';
  declaredDate: Date;
  publishedBy: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectResultSchema = new Schema<ISubjectResult>(
  {
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    internalMarks: { type: Number, required: true, default: 0 },
    externalMarks: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 0 },
    maxMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, required: true, default: 'A' },
    gradePoint: { type: Number, required: true, default: 8 },
    credits: { type: Number, required: true, default: 3 },
    status: { type: String, enum: ['PASS', 'FAIL', 'ABSENT'], default: 'PASS' },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    semester: { type: Number, required: true, index: true },
    academicYear: { type: String, required: true, index: true },
    subjects: [SubjectResultSchema],
    sgpa: { type: Number, required: true, min: 0, max: 10 },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    totalCredits: { type: Number, required: true, default: 20 },
    creditsEarned: { type: Number, required: true, default: 20 },
    totalMarks: { type: Number, default: 0 },
    maxTotalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['PASS', 'FAIL'], default: 'PASS' },
    declaredDate: { type: Date, default: Date.now },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

ResultSchema.index({ student: 1, semester: 1 }, { unique: true });

export const Result: Model<IResult> = mongoose.model<IResult>('Result', ResultSchema);
