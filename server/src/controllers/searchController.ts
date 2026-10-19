import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { Achievement } from '../models/Achievement.js';
import { Complaint } from '../models/Complaint.js';

export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = String(req.query.q || '').trim();

    if (!q || q.length < 2) {
      res.status(200).json({
        success: true,
        data: {
          students: [],
          faculty: [],
          departments: [],
          courses: [],
          achievements: [],
          complaints: [],
        },
      });
      return;
    }

    const regex = new RegExp(q, 'i');

    const [students, faculty, departments, courses, achievements, complaints] = await Promise.all([
      Student.find({
        $or: [
          { 'personalInfo.fullName': regex },
          { studentId: regex },
          { rollNumber: regex },
          { 'personalInfo.email': regex },
        ],
      })
        .populate('academicInfo.department', 'name code')
        .populate('academicInfo.course', 'name code')
        .select('studentId rollNumber personalInfo.fullName personalInfo.photo academicInfo currentCgpa overallAttendancePercentage')
        .limit(8)
        .lean(),

      Faculty.find({
        $or: [
          { employeeId: regex },
          { designation: regex },
          { email: regex },
        ],
      })
        .populate('department', 'name code')
        .populate('user', 'name')
        .limit(5)
        .lean(),

      Department.find({
        $or: [{ name: regex }, { code: regex }],
      })
        .limit(4)
        .lean(),

      Course.find({
        $or: [{ name: regex }, { code: regex }],
      })
        .limit(4)
        .lean(),

      Achievement.find({
        $or: [{ title: regex }, { organization: regex }, { category: regex }],
      })
        .populate('student', 'personalInfo.fullName studentId')
        .limit(5)
        .lean(),

      Complaint.find({
        $or: [{ title: regex }, { category: regex }],
      })
        .populate('student', 'personalInfo.fullName studentId')
        .limit(5)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
        faculty,
        departments,
        courses,
        achievements,
        complaints,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Global search error', errors: [error.message] });
  }
};
