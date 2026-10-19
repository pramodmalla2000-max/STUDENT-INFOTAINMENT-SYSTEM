import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IParent extends Document {
  user: mongoose.Types.ObjectId;
  linkedStudents: mongoose.Types.ObjectId[];
  relationship: string;
  occupation: string;
  phone: string;
  email: string;
  emergencyContact: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema = new Schema<IParent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    linkedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student', index: true }],
    relationship: { type: String, default: 'Father' },
    occupation: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    emergencyContact: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Parent: Model<IParent> = mongoose.model<IParent>('Parent', ParentSchema);
