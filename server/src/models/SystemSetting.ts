import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  category: 'GENERAL' | 'ACADEMIC' | 'ATTENDANCE' | 'NOTIFICATIONS' | 'SECURITY';
  description: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ['GENERAL', 'ACADEMIC', 'ATTENDANCE', 'NOTIFICATIONS', 'SECURITY'],
      default: 'GENERAL',
    },
    description: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemSetting: Model<ISystemSetting> = mongoose.model<ISystemSetting>(
  'SystemSetting',
  SystemSettingSchema
);
