import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Certificate } from '../models/Certificate.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getCertificates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const certificates = await Certificate.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName personalInfo.email academicInfo')
      .sort({ issueDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch certificates', errors: [error.message] });
  }
};

export const createCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { student, title, category, issueDate, issuingOrganization, documentUrl } = req.body;

    const targetStudent = student || req.user?.studentId;
    if (!targetStudent || !title || !issuingOrganization) {
      res.status(400).json({ success: false, message: 'Student, title, and issuing organization are required' });
      return;
    }

    const certificateNumber = `CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const cert = await Certificate.create({
      student: targetStudent,
      certificateNumber,
      title,
      category: category || 'Technical Certification',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      issuingOrganization,
      documentUrl: documentUrl || '',
      verificationUrl: `/verify/certificate/${certificateNumber}`,
      status: 'VERIFIED',
    });

    await logAudit(req, 'CREATE_CERTIFICATE', 'CERTIFICATE', cert._id.toString());

    res.status(201).json({
      success: true,
      message: 'Certificate registered successfully',
      data: cert,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create certificate', errors: [error.message] });
  }
};

export const verifyCertificateByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateNumber } = req.params;

    const cert = await Certificate.findOne({ certificateNumber: certificateNumber.toUpperCase() })
      .populate({
        path: 'student',
        select: 'studentId rollNumber personalInfo.fullName personalInfo.email academicInfo',
        populate: { path: 'academicInfo.department', select: 'name code' },
      })
      .lean();

    if (!cert) {
      res.status(404).json({
        success: false,
        message: 'No certificate found with the specified verification number.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully',
      data: cert,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify certificate', errors: [error.message] });
  }
};
