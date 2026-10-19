import { Response } from 'express';
import { SystemSetting } from '../models/SystemSetting.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getSettings = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await SystemSetting.find().lean();
    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings', errors: [error.message] });
  }
};

export const updateSetting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key, value, category, description } = req.body;

    if (!key) {
      res.status(400).json({ success: false, message: 'Setting key is required' });
      return;
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        category: category || 'GENERAL',
        description: description || '',
        updatedBy: req.user?.userId,
      },
      { upsert: true, new: true }
    );

    await logAudit(req, 'UPDATE_SETTING', 'SETTING', key, { value });

    res.status(200).json({
      success: true,
      message: 'System setting updated successfully',
      data: setting,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update setting', errors: [error.message] });
  }
};
