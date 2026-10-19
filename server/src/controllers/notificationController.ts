import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ user: req.user.userId, read: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', errors: [error.message] });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, user: req.user?.userId }, { read: true });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification', errors: [error.message] });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.user?.userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notifications', errors: [error.message] });
  }
};
