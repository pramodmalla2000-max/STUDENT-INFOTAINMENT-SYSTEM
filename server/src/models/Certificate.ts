import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICertificate extends Document {
  student: mongoose.Types.ObjectId;
  certificateNumber: string;
  title: string;
  category: string;
  issueDate: Date;
  issuingOrganization: string;
  documentUrl?: string;
  verificationUrl?: string;
  status: 'VERIFIED' | 'PENDING' | 'INVALID';
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    certificateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Technical' },
    issueDate: { type: Date, required: true },
    issuingOrganization: { type: String, required: true, trim: true },
    documentUrl: { type: String, default: '' },
    verificationUrl: { type: String, default: '' },
    status: { type: String, enum: ['VERIFIED', 'PENDING', 'INVALID'], default: 'VERIFIED' },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> = mongoose.model<ICertificate>('Certificate', CertificateSchema);
