import mongoose, { Document, Schema, Model } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'OD';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  semester: number;
  academicYear: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'OD'],
      required: true,
      default: 'PRESENT',
      index: true,
    },
    semester: { type: Number, required: true, index: true },
    academicYear: { type: String, required: true, index: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
