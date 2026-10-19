import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssignedClass {
  subject: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  semester: number;
  section: string;
}

export interface IFaculty extends Document {
  employeeId: string;
  user: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  designation: string;
  qualification: string;
  experienceYears: number;
  cabinNumber: string;
  phone: string;
  email: string;
  assignedClasses: IAssignedClass[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experienceYears: { type: Number, default: 0 },
    cabinNumber: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    assignedClasses: [
      {
        subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        semester: { type: Number, required: true },
        section: { type: String, required: true, uppercase: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Faculty: Model<IFaculty> = mongoose.model<IFaculty>('Faculty', FacultySchema);
