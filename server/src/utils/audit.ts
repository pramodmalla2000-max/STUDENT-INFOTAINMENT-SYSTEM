import { AuthenticatedRequest } from '../types/index.js';
import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async (
  req: AuthenticatedRequest,
  action: string,
  entity: string,
  entityId?: string,
  details?: any
) => {
  try {
    const ip = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      user: req?.user?.userId || undefined,
      userName: req?.user?.name || 'System',
      userRole: req?.user?.role || 'SYSTEM',
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      ipAddress: Array.isArray(ip) ? ip[0] : String(ip),
      userAgent: String(userAgent),
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog] Error logging audit action:', err);
  }
};
