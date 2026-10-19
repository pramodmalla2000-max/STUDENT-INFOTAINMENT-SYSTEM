import mongoose, { Document as MongooseDoc, Schema, Model } from 'mongoose';

export type DocumentType =
  | 'ID_PROOF'
  | 'MARKSHEET'
  | 'CERTIFICATE'
  | 'BONAFIDE'
  | 'TRANSFER_CERTIFICATE'
  | 'INTERNSHIP'
  | 'OTHER';

export interface IDocumentRecord extends MongooseDoc {
  student: mongoose.Types.ObjectId;
  title: string;
  fileName: string;
  fileUrl: string;
  type: DocumentType;
  fileSize: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRecordSchema = new Schema<IDocumentRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    type: {
      type: String,
      enum: ['ID_PROOF', 'MARKSHEET', 'CERTIFICATE', 'BONAFIDE', 'TRANSFER_CERTIFICATE', 'INTERNSHIP', 'OTHER'],
      default: 'OTHER',
      index: true,
    },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const DocumentRecord: Model<IDocumentRecord> = mongoose.model<IDocumentRecord>(
  'DocumentRecord',
  DocumentRecordSchema
);
