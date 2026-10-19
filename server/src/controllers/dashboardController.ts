import { Response } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Parent } from '../models/Parent.js';
import { Department } from '../models/Department.js';
import { Result } from '../models/Result.js';
import { Achievement } from '../models/Achievement.js';
import { Complaint } from '../models/Complaint.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getAdminDashboard = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      activeStudents,
      graduatedStudents,
      totalFaculty,
      totalParents,
      totalDepartments,
      pendingComplaints,
      recentAchievements,
      recentStudents,
      studentsByDeptAgg,
      studentsByYearAgg,
      cgpaDistAgg,
      genderAgg,
      placementStatsAgg,
      complaintsCategoryAgg,
      overallStatsAgg,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ 'academicInfo.status': 'ACTIVE' }),
      Student.countDocuments({ 'academicInfo.status': 'GRADUATED' }),
      Faculty.countDocuments({ isActive: true }),
      Parent.countDocuments(),
      Department.countDocuments({ isActive: true }),
      Complaint.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS'] } }),
      Achievement.find().populate('student', 'personalInfo.fullName studentId').sort({ createdAt: -1 }).limit(5).lean(),
      Student.find().sort({ createdAt: -1 }).limit(5).lean(),
      // Students grouped by department
      Student.aggregate([
        {
          $group: {
            _id: '$academicInfo.department',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: '$department' },
        {
          $project: {
            name: '$department.code',
            departmentName: '$department.name',
            students: '$count',
          },
        },
      ]),
      // Students by year of study
      Student.aggregate([
        {
          $group: {
            _id: '$academicInfo.yearOfStudy',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            year: { $concat: ['Year ', { $toString: '$_id' }] },
            count: '$count',
          },
        },
      ]),
      // CGPA distribution brackets
      Student.aggregate([
        {
          $bucket: {
            groupBy: '$currentCgpa',
            boundaries: [0, 5, 6, 7, 8, 9, 10.1],
            default: 'Other',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),
      // Gender distribution
      Student.aggregate([
        {
          $group: {
            _id: '$personalInfo.gender',
            count: { $sum: 1 },
          },
        },
      ]),
      // Placement status statistics
      Student.aggregate([
        {
          $group: {
            _id: '$placementInfo.status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Complaints by category
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      // Average CGPA and Attendance
      Student.aggregate([
        {
          $group: {
            _id: null,
            avgCgpa: { $avg: '$currentCgpa' },
            avgAttendance: { $avg: '$overallAttendancePercentage' },
          },
        },
      ]),
    ]);

    const averageCgpa = overallStatsAgg.length > 0 ? Number(overallStatsAgg[0].avgCgpa.toFixed(2)) : 0;
    const averageAttendance = overallStatsAgg.length > 0 ? Number(overallStatsAgg[0].avgAttendance.toFixed(1)) : 0;

    // Format CGPA distribution for Recharts
    const cgpaDistribution = [
      { range: '< 5.0 (Critical)', count: 0 },
      { range: '5.0 - 5.9', count: 0 },
      { range: '6.0 - 6.9', count: 0 },
      { range: '7.0 - 7.9', count: 0 },
      { range: '8.0 - 8.9', count: 0 },
      { range: '9.0 - 10.0 (Distinction)', count: 0 },
    ];

    cgpaDistAgg.forEach((b) => {
      if (b._id === 0) cgpaDistribution[0].count = b.count;
      else if (b._id === 5) cgpaDistribution[1].count = b.count;
      else if (b._id === 6) cgpaDistribution[2].count = b.count;
      else if (b._id === 7) cgpaDistribution[3].count = b.count;
      else if (b._id === 8) cgpaDistribution[4].count = b.count;
      else if (b._id === 9) cgpaDistribution[5].count = b.count;
    });

    const genderDistribution = genderAgg.map((g) => ({
      name: g._id || 'Not Specified',
      value: g.count,
    }));

    const complaintsByCategory = complaintsCategoryAgg.map((c) => ({
      category: c._id,
      count: c.count,
    }));

    const placementStats = placementStatsAgg.map((p) => ({
      status: p._id,
      count: p.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          activeStudents,
          graduatedStudents,
          totalFaculty,
          totalParents,
          totalDepartments,
          averageAttendance,
          averageCgpa,
          pendingComplaints,
        },
        charts: {
          studentsByDepartment: studentsByDeptAgg,
          studentsByYear: studentsByYearAgg,
          cgpaDistribution,
          genderDistribution,
          complaintsByCategory,
          placementStats,
        },
        recentAchievements,
        recentStudents,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard', errors: [error.message] });
  }
};

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;

    if (!studentId) {
      res.status(404).json({ success: false, message: 'Student record not linked to this account.' });
      return;
    }

    const student = await Student.findById(studentId)
      .populate('academicInfo.department', 'name code')
      .populate('academicInfo.course', 'name code degree')
      .lean();

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const [results, achievements, certificates, complaints, subjectAttendance] = await Promise.all([
      Result.find({ student: studentId }).sort({ semester: 1 }).lean(),
      Achievement.find({ student: studentId }).sort({ achievementDate: -1 }).limit(5).lean(),
      Certificate.find({ student: studentId }).sort({ issueDate: -1 }).limit(5).lean(),
      Complaint.find({ student: studentId }).sort({ createdAt: -1 }).limit(5).lean(),
      Attendance.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(studentId) } },
        {
          $group: {
            _id: '$subject',
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'OD']] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: '_id',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $project: {
            name: '$subject.name',
            code: '$subject.code',
            total: 1,
            present: 1,
            percentage: {
              $round: [{ $multiply: [{ $divide: ['$present', { $cond: [{ $eq: ['$total', 0] }, 1, '$total'] }] }, 100] }, 1],
            },
          },
        },
      ]),
    ]);

    // Trend of SGPA across semesters
    const performanceTrend = results.map((r) => ({
      semester: `Sem ${r.semester}`,
      sgpa: r.sgpa,
      percentage: r.percentage,
    }));

    res.status(200).json({
      success: true,
      data: {
        student,
        metrics: {
          cgpa: student.currentCgpa,
          attendance: student.overallAttendancePercentage,
          activeBacklogs: student.activeBacklogs,
          creditsEarned: student.totalCreditsEarned,
          profileCompletion: student.profileCompletionPercentage,
          semester: student.academicInfo.currentSemester,
          isLowAttendance: student.overallAttendancePercentage < 75,
          isLowCgpa: student.currentCgpa < 6.5,
        },
        performanceTrend,
        subjectAttendance,
        recentResults: results.slice(-2),
        recentAchievements: achievements,
        certificates,
        recentComplaints: complaints,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load student dashboard', errors: [error.message] });
  }
};

export const getParentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parent = await Parent.findOne({ user: req.user?.userId }).populate({
      path: 'linkedStudents',
      populate: [
        { path: 'academicInfo.department', select: 'name code' },
        { path: 'academicInfo.course', select: 'name code' },
      ],
    });

    if (!parent || !parent.linkedStudents || parent.linkedStudents.length === 0) {
      res.status(404).json({ success: false, message: 'No linked child profiles found.' });
      return;
    }

    const primaryStudent: any = parent.linkedStudents[0];

    const [results, achievements, complaints, attendanceAgg] = await Promise.all([
      Result.find({ student: primaryStudent._id }).sort({ semester: 1 }).lean(),
      Achievement.find({ student: primaryStudent._id }).sort({ achievementDate: -1 }).limit(5).lean(),
      Complaint.find({ student: primaryStudent._id }).sort({ createdAt: -1 }).limit(5).lean(),
      Attendance.aggregate([
        { $match: { student: primaryStudent._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        student: primaryStudent,
        linkedStudents: parent.linkedStudents,
        metrics: {
          cgpa: primaryStudent.currentCgpa,
          attendance: primaryStudent.overallAttendancePercentage,
          backlogs: primaryStudent.activeBacklogs,
          isLowAttendance: primaryStudent.overallAttendancePercentage < 75,
        },
        results,
        achievements,
        complaints,
        attendanceBreakdown: attendanceAgg,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load parent dashboard', errors: [error.message] });
  }
};

export const getFacultyDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findOne({ user: req.user?.userId })
      .populate('department', 'name code')
      .populate('assignedClasses.subject', 'name code credits semester')
      .lean();

    const facultyDeptId = faculty?.department?._id;

    const [studentsCount, pendingAchievements, openComplaints, departmentAttendance] = await Promise.all([
      Student.countDocuments(facultyDeptId ? { 'academicInfo.department': facultyDeptId } : {}),
      Achievement.countDocuments({ verificationStatus: 'PENDING' }),
      Complaint.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
      Attendance.aggregate([
        ...(facultyDeptId ? [{ $match: { faculty: faculty?._id } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        faculty,
        metrics: {
          studentsCount,
          pendingAchievements,
          openComplaints,
          assignedClassesCount: faculty?.assignedClasses?.length || 0,
        },
        attendanceBreakdown: departmentAttendance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load faculty dashboard', errors: [error.message] });
  }
};
