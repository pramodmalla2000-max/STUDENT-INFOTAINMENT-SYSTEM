import { Response } from 'express';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, status, priority, studentId } = req.query;

    const filter: any = {};

    if (req.user?.role === 'STUDENT') {
      filter.student = req.user.studentId;
    } else if (req.user?.role === 'PARENT') {
      const parentRecord = await Parent.findOne({ user: req.user.userId });
      if (parentRecord) {
        filter.student = { $in: parentRecord.linkedStudents };
      }
    } else if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.student = studentId;
      } else {
        const s = await Student.findOne({ studentId: String(studentId).toUpperCase() });
        if (s) filter.student = s._id;
      }
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName personalInfo.email academicInfo')
      .populate('assignedTo', 'name email role')
      .populate('history.updatedBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints', errors: [error.message] });
  }
};

export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, category, description, priority, attachments } = req.body;

    const studentId = req.body.student || req.user?.studentId;

    if (!studentId || !title || !category || !description) {
      res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
      return;
    }

    const complaint = await Complaint.create({
      student: studentId,
      title,
      category,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      attachments: attachments || [],
      history: [
        {
          status: 'OPEN',
          comment: 'Grievance ticket created by student.',
          updatedBy: req.user?.userId,
          updatedAt: new Date(),
        },
      ],
    });

    await logAudit(req, 'CREATE_COMPLAINT', 'COMPLAINT', complaint._id.toString());

    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully. The administration has been notified.',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit grievance', errors: [error.message] });
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolution, assignedTo, comment } = req.body;

    const complaint = await Complaint.findById(id).populate('student');
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }

    if (status) complaint.status = status;
    if (resolution) {
      complaint.resolution = resolution;
      complaint.resolvedAt = new Date();
    }
    if (assignedTo) complaint.assignedTo = assignedTo;

    complaint.history.push({
      status: status || complaint.status,
      comment: comment || resolution || `Status changed to ${status}`,
      updatedBy: new mongoose.Types.ObjectId(req.user?.userId),
      updatedAt: new Date(),
    });

    await complaint.save();

    // Notify student
    const student = await Student.findById(complaint.student).populate('user');
    if (student?.user) {
      await Notification.create({
        user: student.user,
        title: `Grievance Update: ${complaint.title}`,
        message: `Your grievance ticket is now ${status}. ${comment || resolution || ''}`,
        type: status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
        link: `/student/complaints`,
      });
    }

    await logAudit(req, 'UPDATE_COMPLAINT', 'COMPLAINT', id, { status, resolution });

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update complaint', errors: [error.message] });
  }
};
