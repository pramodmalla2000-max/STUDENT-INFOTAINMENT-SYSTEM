import mongoose, { Document, Schema, Model } from 'mongoose';

export type SubjectType = 'THEORY' | 'LAB' | 'ELECTIVE' | 'PROJECT';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  semester: number;
  credits: number;
  type: SubjectType;
  maxInternalMarks: number;
  maxExternalMarks: number;
  totalMarks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    credits: { type: Number, required: true, default: 3 },
    type: {
      type: String,
      enum: ['THEORY', 'LAB', 'ELECTIVE', 'PROJECT'],
      default: 'THEORY',
    },
    maxInternalMarks: { type: Number, default: 40 },
    maxExternalMarks: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ code: 1, course: 1 }, { unique: true });

export const Subject: Model<ISubject> = mongoose.model<ISubject>('Subject', SubjectSchema);
