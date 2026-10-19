import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid.',
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.',
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      studentId: user.studentRef?.toString(),
      facultyId: user.facultyRef?.toString(),
      parentId: user.parentRef?.toString(),
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      errors: [error.message],
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] permissions.`,
      });
      return;
    }
    next();
  };
};

export const studentAccessGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Admins and faculty have institutional access
    if (['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(req.user.role)) {
      return next();
    }

    const targetStudentId = req.params.studentId || req.params.id;

    if (!targetStudentId) {
      return next();
    }

    if (req.user.role === 'STUDENT') {
      const studentRecord = await Student.findOne({
        $or: [{ _id: targetStudentId }, { studentId: targetStudentId.toUpperCase() }],
      }).lean();

      if (!studentRecord) {
        res.status(404).json({ success: false, message: 'Student record not found.' });
        return;
      }

      if (studentRecord.user.toString() !== req.user.userId && studentRecord._id.toString() !== req.user.studentId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You may only view your own student record.',
        });
        return;
      }
      return next();
    }

    if (req.user.role === 'PARENT') {
      const parentRecord = await Parent.findOne({ user: req.user.userId }).lean();
      if (!parentRecord) {
        res.status(403).json({ success: false, message: 'Parent profile not linked.' });
        return;
      }

      const studentRecord = await Student.findOne({
        $or: [{ _id: targetStudentId }, { studentId: targetStudentId.toUpperCase() }],
      }).lean();

      if (!studentRecord) {
        res.status(404).json({ success: false, message: 'Student record not found.' });
        return;
      }

      const isChildLinked = parentRecord.linkedStudents.some(
        (id) => id.toString() === studentRecord._id.toString()
      );

      if (!isChildLinked) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You may only view records for your linked child.',
        });
        return;
      }
      return next();
    }

    res.status(403).json({ success: false, message: 'Access denied.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Authorization error', errors: [error.message] });
  }
};
