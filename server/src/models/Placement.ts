import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPlacement extends Document {
  student: mongoose.Types.ObjectId;
  company: string;
  packageLPA: number;
  role: string;
  placementType: 'FULL_TIME' | 'INTERNSHIP' | 'PPO';
  offerDate: Date;
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED';
  location: string;
  offerLetterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementSchema = new Schema<IPlacement>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    company: { type: String, required: true, trim: true },
    packageLPA: { type: Number, required: true },
    role: { type: String, required: true, trim: true },
    placementType: { type: String, enum: ['FULL_TIME', 'INTERNSHIP', 'PPO'], default: 'FULL_TIME' },
    offerDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['OFFERED', 'ACCEPTED', 'REJECTED'], default: 'ACCEPTED' },
    location: { type: String, default: '' },
    offerLetterUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Placement: Model<IPlacement> = mongoose.model<IPlacement>('Placement', PlacementSchema);
