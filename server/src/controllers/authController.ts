import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Parent } from '../models/Parent.js';
import { signToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Student ID is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parseResult.error.errors.map((e) => e.message),
      });
      return;
    }

    const { identifier, password } = parseResult.data;
    const cleanId = identifier.trim();

    // Check if identifier is an email or studentId/rollNumber
    let user: any = await User.findOne({ email: cleanId.toLowerCase() }).select('+password');

    // If not found by email, check if identifier is a studentId or rollNumber
    if (!user) {
      const student = await Student.findOne({
        $or: [{ studentId: cleanId.toUpperCase() }, { rollNumber: cleanId.toUpperCase() }],
      });
      if (student) {
        user = await User.findById(student.user).select('+password');
      }
    }

    // Also check faculty employeeId
    if (!user) {
      const faculty = await Faculty.findOne({ employeeId: cleanId.toUpperCase() });
      if (faculty) {
        user = await User.findById(faculty.user).select('+password');
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. User does not exist.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email/ID or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact your college administrator.',
      });
      return;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Extract connected role IDs
    let studentId = user.studentRef?.toString();
    let facultyId = user.facultyRef?.toString();
    let parentId = user.parentRef?.toString();

    if (user.role === 'STUDENT' && !studentId) {
      const s = await Student.findOne({ user: user._id });
      if (s) studentId = s._id.toString();
    } else if (user.role === 'PARENT' && !parentId) {
      const p = await Parent.findOne({ user: user._id });
      if (p) parentId = p._id.toString();
    } else if (user.role === 'FACULTY' && !facultyId) {
      const f = await Faculty.findOne({ user: user._id });
      if (f) facultyId = f._id.toString();
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      studentId,
      facultyId,
      parentId,
    });

    (req as AuthenticatedRequest).user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      studentId,
      facultyId,
      parentId,
    };

    await logAudit(
      req as AuthenticatedRequest,
      'LOGIN',
      'USER',
      user._id.toString(),
      { email: user.email, role: user.role }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          studentId,
          facultyId,
          parentId,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed due to internal error',
      errors: [error.message],
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let extraProfile: any = null;
    if (user.role === 'STUDENT') {
      extraProfile = await Student.findOne({ user: user._id })
        .populate('academicInfo.department', 'name code')
        .populate('academicInfo.course', 'name code degree')
        .lean();
    } else if (user.role === 'PARENT') {
      extraProfile = await Parent.findOne({ user: user._id })
        .populate({
          path: 'linkedStudents',
          select: 'studentId rollNumber personalInfo academicInfo currentCgpa overallAttendancePercentage',
          populate: { path: 'academicInfo.department', select: 'name code' },
        })
        .lean();
    } else if (user.role === 'FACULTY') {
      extraProfile = await Faculty.findOne({ user: user._id })
        .populate('department', 'name code')
        .populate('assignedClasses.subject', 'name code credits')
        .lean();
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        profile: extraProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile', errors: [error.message] });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid password format. Must be at least 6 characters.',
      });
      return;
    }

    const { currentPassword, newPassword } = parseResult.data;
    const user = await User.findById(req.user?.userId).select('+password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, 'CHANGE_PASSWORD', 'USER', user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error changing password', errors: [error.message] });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user) {
    await logAudit(req, 'LOGOUT', 'USER', req.user.userId);
  }
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
