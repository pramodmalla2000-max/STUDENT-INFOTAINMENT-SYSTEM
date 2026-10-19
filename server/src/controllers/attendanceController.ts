import { Response } from 'express';
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, subjectId, semester, startDate, endDate, status } = req.query;

    const filter: any = {};

    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.student = studentId;
      } else {
        const student = await Student.findOne({ studentId: String(studentId).toUpperCase() });
        if (student) filter.student = student._id;
      }
    }

    if (subjectId && mongoose.Types.ObjectId.isValid(String(subjectId))) {
      filter.subject = subjectId;
    }
    if (semester) {
      filter.semester = Number(semester);
    }
    if (status) {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(String(startDate));
      if (endDate) filter.date.$lte = new Date(String(endDate));
    }

    const records = await Attendance.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName personalInfo.email')
      .populate('subject', 'name code credits')
      .populate('faculty', 'employeeId designation')
      .sort({ date: -1 })
      .limit(200)
      .lean();

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', errors: [error.message] });
  }
};

export const markAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { student, subject, faculty, date, status, semester, academicYear, remarks } = req.body;

    const record = await Attendance.findOneAndUpdate(
      {
        student,
        subject,
        date: new Date(date).setHours(0, 0, 0, 0),
      },
      {
        student,
        subject,
        faculty: faculty || req.user?.facultyId || req.user?.userId,
        date: new Date(date).setHours(0, 0, 0, 0),
        status,
        semester,
        academicYear,
        remarks,
      },
      { upsert: true, new: true }
    );

    // Update student's overall attendance %
    await updateStudentAttendanceSummary(student);

    await logAudit(req, 'MARK_ATTENDANCE', 'ATTENDANCE', record._id.toString());

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save attendance', errors: [error.message] });
  }
};

export const markBulkAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { subject, faculty, date, semester, academicYear, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ success: false, message: 'Records array is required' });
      return;
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const operations = records.map((r: { student: string; status: string; remarks?: string }) => ({
      updateOne: {
        filter: {
          student: r.student,
          subject,
          date: parsedDate,
        },
        update: {
          $set: {
            student: r.student,
            subject,
            faculty: faculty || req.user?.facultyId || req.user?.userId,
            date: parsedDate,
            status: r.status,
            semester,
            academicYear,
            remarks: r.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations as any);

    // Recalculate attendance for affected students
    const studentIds = records.map((r) => r.student);
    for (const sid of studentIds) {
      await updateStudentAttendanceSummary(sid);
    }

    await logAudit(req, 'BULK_ATTENDANCE', 'ATTENDANCE', undefined, {
      subject,
      totalStudents: records.length,
      date: parsedDate,
    });

    res.status(200).json({
      success: true,
      message: `Bulk attendance recorded for ${records.length} students.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record bulk attendance', errors: [error.message] });
  }
};

export const getStudentSubjectAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(studentId) ? studentId : null }, { studentId: studentId.toUpperCase() }],
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const subjectStats = await Attendance.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: '$subject',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'OD']] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      { $unwind: '$subjectDetails' },
      {
        $project: {
          subjectId: '$_id',
          subjectName: '$subjectDetails.name',
          subjectCode: '$subjectDetails.code',
          credits: '$subjectDetails.credits',
          total: 1,
          present: 1,
          late: 1,
          absent: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $add: ['$present', { $multiply: ['$late', 0.5] }] },
                      { $cond: [{ $eq: ['$total', 0] }, 1, '$total'] },
                    ],
                  },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: subjectStats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch subject attendance', errors: [error.message] });
  }
};

async function updateStudentAttendanceSummary(studentId: string | mongoose.Types.ObjectId) {
  try {
    const stats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(String(studentId)) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [
                { $in: ['$status', ['PRESENT', 'OD']] },
                1,
                { $cond: [{ $eq: ['$status', 'LATE'] }, 0.5, 0] },
              ],
            },
          },
        },
      },
    ]);

    if (stats.length > 0 && stats[0].total > 0) {
      const percentage = Number(((stats[0].attended / stats[0].total) * 100).toFixed(1));
      await Student.findByIdAndUpdate(studentId, { overallAttendancePercentage: percentage });
    }
  } catch (e) {
    console.error('Error updating attendance summary:', e);
  }
}
