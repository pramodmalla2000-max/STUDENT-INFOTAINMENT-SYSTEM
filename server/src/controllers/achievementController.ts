import { Response } from 'express';
import mongoose from 'mongoose';
import { Achievement } from '../models/Achievement.js';
import { Student } from '../models/Student.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, category, verificationStatus, level } = req.query;

    const filter: any = {};

    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.student = studentId;
      } else {
        const s = await Student.findOne({ studentId: String(studentId).toUpperCase() });
        if (s) filter.student = s._id;
      }
    }

    if (category) filter.category = category;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (level) filter.level = level;

    const achievements = await Achievement.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName personalInfo.email academicInfo')
      .populate('verifiedBy', 'name email role')
      .sort({ achievementDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', errors: [error.message] });
  }
};

export const createAchievement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      student,
      title,
      category,
      description,
      achievementDate,
      organization,
      level,
      position,
      documentUrl,
    } = req.body;

    const targetStudentId = student || req.user?.studentId;

    if (!targetStudentId || !title || !category || !organization) {
      res.status(400).json({ success: false, message: 'Student, title, category, and organization are required' });
      return;
    }

    const isAuthorizedApprover = ['SUPER_ADMIN', 'ADMIN', 'FACULTY'].includes(req.user?.role || '');

    const achievement = await Achievement.create({
      student: targetStudentId,
      title,
      category,
      description,
      achievementDate: achievementDate ? new Date(achievementDate) : new Date(),
      organization,
      level: level || 'College',
      position: position || 'Winner',
      documentUrl: documentUrl || '',
      verificationStatus: isAuthorizedApprover ? 'VERIFIED' : 'PENDING',
      verifiedBy: isAuthorizedApprover ? req.user?.userId : undefined,
      verifiedAt: isAuthorizedApprover ? new Date() : undefined,
    });

    await logAudit(req, 'CREATE_ACHIEVEMENT', 'ACHIEVEMENT', achievement._id.toString());

    res.status(201).json({
      success: true,
      message: isAuthorizedApprover
        ? 'Achievement recorded and verified'
        : 'Achievement submitted for faculty verification',
      data: achievement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create achievement', errors: [error.message] });
  }
};

export const verifyAchievement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED' });
      return;
    }

    const achievement = await Achievement.findByIdAndUpdate(
      id,
      {
        verificationStatus: status,
        verificationRemarks: remarks || '',
        verifiedBy: req.user?.userId,
        verifiedAt: new Date(),
      },
      { new: true }
    ).populate('student');

    if (!achievement) {
      res.status(404).json({ success: false, message: 'Achievement not found' });
      return;
    }

    // Send notification to student
    const student = await Student.findById(achievement.student).populate('user');
    if (student?.user) {
      await Notification.create({
        user: student.user,
        title: `Achievement ${status}: ${achievement.title}`,
        message: `Your achievement "${achievement.title}" was marked as ${status}. ${remarks || ''}`,
        type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        link: `/student/achievements`,
      });
    }

    await logAudit(req, 'VERIFY_ACHIEVEMENT', 'ACHIEVEMENT', id, { status, remarks });

    res.status(200).json({
      success: true,
      message: `Achievement status updated to ${status}`,
      data: achievement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify achievement', errors: [error.message] });
  }
};

export const deleteAchievement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Achievement.findByIdAndDelete(id);
    await logAudit(req, 'DELETE_ACHIEVEMENT', 'ACHIEVEMENT', id);
    res.status(200).json({ success: true, message: 'Achievement deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete achievement', errors: [error.message] });
  }
};
