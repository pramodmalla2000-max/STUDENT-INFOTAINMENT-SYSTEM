import mongoose, { Document, Schema, Model } from 'mongoose';

export type ComplaintCategory =
  | 'Academic'
  | 'Faculty'
  | 'Infrastructure'
  | 'Hostel'
  | 'Transport'
  | 'Fees'
  | 'Examination'
  | 'Harassment'
  | 'Technical'
  | 'Other';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface IComplaintHistory {
  status: ComplaintStatus;
  comment: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

export interface IComplaint extends Document {
  student: mongoose.Types.ObjectId;
  title: string;
  category: ComplaintCategory;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  attachments: string[];
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  history: IComplaintHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Academic',
        'Faculty',
        'Infrastructure',
        'Hostel',
        'Transport',
        'Fees',
        'Examination',
        'Harassment',
        'Technical',
        'Other',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    attachments: [{ type: String }],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String, default: '' },
    resolvedAt: { type: Date },
    history: [
      {
        status: { type: String, required: true },
        comment: { type: String, default: '' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Complaint: Model<IComplaint> = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
