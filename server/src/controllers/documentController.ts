import { Response } from 'express';
import mongoose from 'mongoose';
import { DocumentRecord } from '../models/Document.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const uploadDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const { studentId, title, type } = req.body;
    const targetStudentId = studentId || req.user?.studentId;

    if (!targetStudentId) {
      res.status(400).json({ success: false, message: 'Student ID is required' });
      return;
    }

    const fileUrl = `/uploads/${file.filename}`;

    const doc = await DocumentRecord.create({
      student: targetStudentId,
      title: title || file.originalname,
      fileName: file.originalname,
      fileUrl,
      type: type || 'OTHER',
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user?.userId,
    });

    await logAudit(req, 'UPLOAD_DOCUMENT', 'DOCUMENT', doc._id.toString(), {
      student: targetStudentId,
      fileName: file.originalname,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to upload document', errors: [error.message] });
  }
};

export const getDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.query;

    const filter: any = {};
    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.student = studentId;
      } else {
        const s = await Student.findOne({ studentId: String(studentId).toUpperCase() });
        if (s) filter.student = s._id;
      }
    }

    const docs = await DocumentRecord.find(filter)
      .populate('uploadedBy', 'name role email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', errors: [error.message] });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DocumentRecord.findByIdAndDelete(id);
    await logAudit(req, 'DELETE_DOCUMENT', 'DOCUMENT', id);
    res.status(200).json({ success: true, message: 'Document removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete document', errors: [error.message] });
  }
};
