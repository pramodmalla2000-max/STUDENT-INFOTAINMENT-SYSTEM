import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'SUCCESS', 'ALERT'], default: 'INFO' },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
    relatedEntity: {
      entityType: { type: String },
      entityId: { type: String },
    },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
