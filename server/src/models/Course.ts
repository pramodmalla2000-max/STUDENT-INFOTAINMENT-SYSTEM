import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  degree: string;
  department: mongoose.Types.ObjectId;
  durationYears: number;
  totalSemesters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    degree: { type: String, required: true, default: 'B.Tech' },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    durationYears: { type: Number, required: true, default: 4 },
    totalSemesters: { type: Number, required: true, default: 8 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema);
