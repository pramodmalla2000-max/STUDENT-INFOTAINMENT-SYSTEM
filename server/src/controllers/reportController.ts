import { Response } from 'express';
import { Student } from '../models/Student.js';
import { Result } from '../models/Result.js';
import { Complaint } from '../models/Complaint.js';
import { Achievement } from '../models/Achievement.js';
import { AuthenticatedRequest } from '../types/index.js';

export const exportStudentsReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { format = 'json', department } = req.query;

    const filter: any = {};
    if (department) filter['academicInfo.department'] = department;

    const students = await Student.find(filter)
      .populate('academicInfo.department', 'name code')
      .populate('academicInfo.course', 'name code')
      .lean();

    if (format === 'csv') {
      const headers = [
        'Student ID',
        'Roll Number',
        'Full Name',
        'Email',
        'Phone',
        'Department',
        'Course',
        'Year',
        'Semester',
        'Section',
        'CGPA',
        'Attendance %',
        'Backlogs',
        'Placement Status',
      ];

      const rows = students.map((s) => [
        `"${s.studentId}"`,
        `"${s.rollNumber}"`,
        `"${s.personalInfo?.fullName || ''}"`,
        `"${s.personalInfo?.email || ''}"`,
        `"${s.personalInfo?.phone || ''}"`,
        `"${(s.academicInfo?.department as any)?.code || ''}"`,
        `"${(s.academicInfo?.course as any)?.code || ''}"`,
        s.academicInfo?.yearOfStudy || '',
        s.academicInfo?.currentSemester || '',
        `"${s.academicInfo?.section || ''}"`,
        s.currentCgpa || 0,
        s.overallAttendancePercentage || 0,
        s.activeBacklogs || 0,
        `"${s.placementInfo?.status || 'UNPLACED'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
      res.status(200).send(csvContent);
      return;
    }

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate students report', errors: [error.message] });
  }
};

export const exportResultsReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { format = 'json', semester } = req.query;

    const filter: any = {};
    if (semester) filter.semester = Number(semester);

    const results = await Result.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName')
      .lean();

    if (format === 'csv') {
      const headers = ['Student ID', 'Roll Number', 'Student Name', 'Semester', 'SGPA', 'Credits', 'Status'];
      const rows = results.map((r: any) => [
        `"${r.student?.studentId || ''}"`,
        `"${r.student?.rollNumber || ''}"`,
        `"${r.student?.personalInfo?.fullName || ''}"`,
        r.semester,
        r.sgpa,
        r.creditsEarned,
        `"${r.status}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=results_report.csv');
      res.status(200).send(csvContent);
      return;
    }

    res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate results report', errors: [error.message] });
  }
};

export const exportComplaintsReport = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'studentId personalInfo.fullName')
      .populate('assignedTo', 'name email')
      .lean();

    res.status(200).json({ success: true, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export complaints', errors: [error.message] });
  }
};

export const exportAchievementsReport = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const achievements = await Achievement.find()
      .populate('student', 'studentId personalInfo.fullName')
      .lean();

    res.status(200).json({ success: true, data: achievements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export achievements', errors: [error.message] });
  }
};
