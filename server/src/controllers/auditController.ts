import { Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const { action, entity, userRole } = req.query;

    const filter: any = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userRole) filter.userRole = userRole;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', errors: [error.message] });
  }
};
