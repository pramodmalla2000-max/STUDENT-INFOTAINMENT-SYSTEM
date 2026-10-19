import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDisciplinaryRecord extends Document {
  student: mongoose.Types.ObjectId;
  incident: string;
  incidentDate: Date;
  description: string;
  actionTaken: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  reportedBy?: mongoose.Types.ObjectId;
  resolutionRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisciplinaryRecordSchema = new Schema<IDisciplinaryRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    incident: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    description: { type: String, required: true },
    actionTaken: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const DisciplinaryRecord: Model<IDisciplinaryRecord> = mongoose.model<IDisciplinaryRecord>(
  'DisciplinaryRecord',
  DisciplinaryRecordSchema
);
