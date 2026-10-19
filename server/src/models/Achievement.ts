import mongoose, { Document, Schema, Model } from 'mongoose';

export type AchievementCategory =
  | 'Hackathon'
  | 'Academic'
  | 'Sports'
  | 'Cultural'
  | 'Certification'
  | 'Internship'
  | 'Research'
  | 'Competition'
  | 'Leadership'
  | 'Other';

export type AchievementLevel = 'College' | 'District' | 'State' | 'National' | 'International';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IAchievement extends Document {
  student: mongoose.Types.ObjectId;
  title: string;
  category: AchievementCategory;
  description: string;
  achievementDate: Date;
  organization: string;
  level: AchievementLevel;
  position: string;
  documentUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Hackathon',
        'Academic',
        'Sports',
        'Cultural',
        'Certification',
        'Internship',
        'Research',
        'Competition',
        'Leadership',
        'Other',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    achievementDate: { type: Date, required: true },
    organization: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['College', 'District', 'State', 'National', 'International'],
      required: true,
      default: 'College',
    },
    position: { type: String, required: true, default: 'Participant' },
    documentUrl: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    verificationRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Achievement: Model<IAchievement> = mongoose.model<IAchievement>('Achievement', AchievementSchema);
