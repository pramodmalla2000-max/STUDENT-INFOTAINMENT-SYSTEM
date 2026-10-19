import { Response } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Parent } from '../models/Parent.js';
import { Attendance } from '../models/Attendance.js';
import { Result } from '../models/Result.js';
import { Achievement } from '../models/Achievement.js';
import { Certificate } from '../models/Certificate.js';
import { Complaint } from '../models/Complaint.js';
import { DocumentRecord } from '../models/Document.js';
import { DisciplinaryRecord } from '../models/DisciplinaryRecord.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

export const getStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      department,
      course,
      batch,
      semester,
      section,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { 'personalInfo.fullName': searchRegex },
        { studentId: searchRegex },
        { rollNumber: searchRegex },
        { 'personalInfo.email': searchRegex },
      ];
    }

    if (department && mongoose.Types.ObjectId.isValid(String(department))) {
      filter['academicInfo.department'] = department;
    }
    if (course && mongoose.Types.ObjectId.isValid(String(course))) {
      filter['academicInfo.course'] = course;
    }
    if (batch) {
      filter['academicInfo.batch'] = batch;
    }
    if (semester) {
      filter['academicInfo.currentSemester'] = Number(semester);
    }
    if (section) {
      filter['academicInfo.section'] = String(section).toUpperCase();
    }
    if (status) {
      filter['academicInfo.status'] = status;
    }

    const sortOptions: any = {};
    const direction = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      sortOptions['personalInfo.fullName'] = direction;
    } else if (sortBy === 'rollNumber') {
      sortOptions['rollNumber'] = direction;
    } else if (sortBy === 'cgpa') {
      sortOptions['currentCgpa'] = direction;
    } else if (sortBy === 'attendance') {
      sortOptions['overallAttendancePercentage'] = direction;
    } else {
      sortOptions[String(sortBy)] = direction;
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('academicInfo.department', 'name code')
        .populate('academicInfo.course', 'name code degree')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', errors: [error.message] });
  }
};

export const getStudentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { studentId: id.toUpperCase() }] } : { studentId: id.toUpperCase() };

    const student = await Student.findOne(query)
      .populate('academicInfo.department', 'name code description')
      .populate('academicInfo.course', 'name code degree totalSemesters')
      .populate('user', 'email avatar isActive lastLogin')
      .populate('parentUser', 'name email phone')
      .lean();

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const studentObjectId = student._id;

    // Fetch complete 360° data in parallel for ultimate efficiency
    const [
      results,
      achievements,
      certificates,
      complaints,
      documents,
      disciplinaryRecords,
      attendanceStats,
    ] = await Promise.all([
      Result.find({ student: studentObjectId })
        .populate('subjects.subject', 'name code credits type')
        .sort({ semester: 1 })
        .lean(),
      Achievement.find({ student: studentObjectId }).sort({ achievementDate: -1 }).lean(),
      Certificate.find({ student: studentObjectId }).sort({ issueDate: -1 }).lean(),
      Complaint.find({ student: studentObjectId })
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      DocumentRecord.find({ student: studentObjectId }).sort({ createdAt: -1 }).lean(),
      DisciplinaryRecord.find({ student: studentObjectId }).sort({ incidentDate: -1 }).lean(),
      // Attendance summary by status
      Attendance.aggregate([
        { $match: { student: studentObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Calculate detailed attendance breakdown
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let odCount = 0;
    let totalClasses = 0;

    attendanceStats.forEach((stat) => {
      totalClasses += stat.count;
      if (stat._id === 'PRESENT') presentCount = stat.count;
      if (stat._id === 'ABSENT') absentCount = stat.count;
      if (stat._id === 'LATE') lateCount = stat.count;
      if (stat._id === 'OD') odCount = stat.count;
    });

    const attendedClasses = presentCount + odCount + Math.floor(lateCount * 0.5);
    const calculatedAttendance = totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) : 100;

    // Build Chronological Activity Timeline
    const timelineEvents: any[] = [];

    results.forEach((r) => {
      timelineEvents.push({
        type: 'RESULT',
        title: `Semester ${r.semester} Results Declared`,
        subtitle: `SGPA: ${r.sgpa} | Credits: ${r.creditsEarned} | Status: ${r.status}`,
        date: r.declaredDate || r.createdAt,
        badgeColor: r.status === 'PASS' ? 'green' : 'red',
      });
    });

    achievements.forEach((a) => {
      timelineEvents.push({
        type: 'ACHIEVEMENT',
        title: `Achievement: ${a.title}`,
        subtitle: `${a.position} at ${a.organization} (${a.level} Level)`,
        date: a.achievementDate,
        badgeColor: 'amber',
      });
    });

    certificates.forEach((c) => {
      timelineEvents.push({
        type: 'CERTIFICATE',
        title: `Certificate: ${c.title}`,
        subtitle: `Issued by ${c.issuingOrganization} (#${c.certificateNumber})`,
        date: c.issueDate,
        badgeColor: 'blue',
      });
    });

    complaints.forEach((cmp) => {
      timelineEvents.push({
        type: 'COMPLAINT',
        title: `Grievance: ${cmp.title}`,
        subtitle: `Category: ${cmp.category} | Status: ${cmp.status}`,
        date: cmp.createdAt,
        badgeColor: cmp.status === 'RESOLVED' ? 'emerald' : 'purple',
      });
    });

    documents.forEach((d) => {
      timelineEvents.push({
        type: 'DOCUMENT',
        title: `Document Uploaded: ${d.title}`,
        subtitle: `Type: ${d.type} | File: ${d.fileName}`,
        date: d.createdAt,
        badgeColor: 'teal',
      });
    });

    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          totalClasses,
          presentCount,
          absentCount,
          lateCount,
          odCount,
          attendancePercentage: calculatedAttendance,
          isLowAttendance: calculatedAttendance < 75,
          currentCgpa: student.currentCgpa,
          isLowCgpa: student.currentCgpa < 6.5,
          totalCredits: student.totalCreditsEarned,
          backlogsCount: student.activeBacklogs,
        },
        results,
        achievements,
        certificates,
        complaints,
        documents,
        disciplinaryRecords,
        timeline: timelineEvents,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve 360 profile', errors: [error.message] });
  }
};

export const createStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { personalInfo, academicInfo, parentInfo, placementInfo } = req.body;

    if (!personalInfo?.email || !personalInfo?.firstName || !personalInfo?.lastName) {
      res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
      return;
    }

    // Check email uniqueness
    const existingUser = await User.findOne({ email: personalInfo.email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
      return;
    }

    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    const studentId = (
      req.body.studentId ||
      `25B21AI${Math.floor(100 + Math.random() * 900)}`
    ).toUpperCase();
    const rollNumber = req.body.rollNumber || studentId;
    const admissionNumber = req.body.admissionNumber || `ADM-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create Student User Account
    const studentUser = await User.create({
      name: fullName,
      email: personalInfo.email.toLowerCase(),
      password: req.body.password || 'Student@123',
      role: 'STUDENT',
      phone: personalInfo.phone,
      avatar: personalInfo.photo || '',
      isActive: true,
    });

    // 2. Create or find Parent User Account if parent email provided
    let parentUserRecord: any = null;
    if (parentInfo?.parentEmail) {
      let pUser = await User.findOne({ email: parentInfo.parentEmail.toLowerCase() });
      if (!pUser) {
        pUser = await User.create({
          name: parentInfo.fatherName || parentInfo.guardianName || 'Parent',
          email: parentInfo.parentEmail.toLowerCase(),
          password: 'Parent@123',
          role: 'PARENT',
          phone: parentInfo.parentPhone,
          isActive: true,
        });
      }
      parentUserRecord = pUser;
    }

    // 3. Create Student record
    const student = await Student.create({
      studentId,
      rollNumber,
      admissionNumber,
      user: studentUser._id,
      parentUser: parentUserRecord ? parentUserRecord._id : undefined,
      personalInfo: {
        ...personalInfo,
        fullName,
      },
      academicInfo: {
        ...academicInfo,
        status: academicInfo?.status || 'ACTIVE',
      },
      parentInfo: {
        ...parentInfo,
      },
      placementInfo: {
        status: placementInfo?.status || 'UNPLACED',
        ...placementInfo,
      },
      currentCgpa: req.body.currentCgpa || 8.0,
      totalCreditsEarned: req.body.totalCreditsEarned || 20,
      activeBacklogs: req.body.activeBacklogs || 0,
      overallAttendancePercentage: req.body.overallAttendancePercentage || 85,
      profileCompletionPercentage: 90,
    });

    // Link student ref in Student User
    studentUser.studentRef = student._id;
    await studentUser.save();

    // Link student in Parent record
    if (parentUserRecord) {
      await Parent.findOneAndUpdate(
        { user: parentUserRecord._id },
        {
          $addToSet: { linkedStudents: student._id },
          user: parentUserRecord._id,
          phone: parentInfo.parentPhone || '',
          email: parentInfo.parentEmail.toLowerCase(),
          relationship: parentInfo.relationship || 'Father',
        },
        { upsert: true, new: true }
      );
    }

    await logAudit(req, 'CREATE_STUDENT', 'STUDENT', student._id.toString(), {
      studentId,
      rollNumber,
      email: personalInfo.email,
    });

    res.status(201).json({
      success: true,
      message: 'Student profile and credentials created successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create student', errors: [error.message] });
  }
};

export const updateStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // If user is STUDENT role, only allow updating personal info (phone, address, photo)
    if (req.user?.role === 'STUDENT') {
      if (req.body.personalInfo) {
        if (req.body.personalInfo.phone) student.personalInfo.phone = req.body.personalInfo.phone;
        if (req.body.personalInfo.address) student.personalInfo.address = req.body.personalInfo.address;
        if (req.body.personalInfo.city) student.personalInfo.city = req.body.personalInfo.city;
        if (req.body.personalInfo.state) student.personalInfo.state = req.body.personalInfo.state;
        if (req.body.personalInfo.pincode) student.personalInfo.pincode = req.body.personalInfo.pincode;
        if (req.body.personalInfo.photo) student.personalInfo.photo = req.body.personalInfo.photo;
      }
    } else {
      // Admin or Faculty full update
      if (req.body.personalInfo) {
        student.personalInfo = {
          ...student.personalInfo,
          ...req.body.personalInfo,
          fullName: `${req.body.personalInfo.firstName || student.personalInfo.firstName} ${
            req.body.personalInfo.lastName || student.personalInfo.lastName
          }`.trim(),
        };
      }
      if (req.body.academicInfo) {
        student.academicInfo = { ...student.academicInfo, ...req.body.academicInfo };
      }
      if (req.body.parentInfo) {
        student.parentInfo = { ...student.parentInfo, ...req.body.parentInfo };
      }
      if (req.body.placementInfo) {
        student.placementInfo = { ...student.placementInfo, ...req.body.placementInfo };
      }
      if (req.body.currentCgpa !== undefined) student.currentCgpa = req.body.currentCgpa;
      if (req.body.overallAttendancePercentage !== undefined)
        student.overallAttendancePercentage = req.body.overallAttendancePercentage;
      if (req.body.activeBacklogs !== undefined) student.activeBacklogs = req.body.activeBacklogs;
      if (req.body.remarks !== undefined) student.remarks = req.body.remarks;
    }

    await student.save();

    await logAudit(req, 'UPDATE_STUDENT', 'STUDENT', student._id.toString());

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update student', errors: [error.message] });
  }
};

export const deleteStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Toggle status or deactivate
    student.academicInfo.status = student.academicInfo.status === 'DROPPED' ? 'ACTIVE' : 'DROPPED';
    await student.save();

    // Also deactivate user
    await User.findByIdAndUpdate(student.user, { isActive: student.academicInfo.status === 'ACTIVE' });

    await logAudit(req, 'STATUS_CHANGE_STUDENT', 'STUDENT', student._id.toString(), {
      newStatus: student.academicInfo.status,
    });

    res.status(200).json({
      success: true,
      message: `Student status changed to ${student.academicInfo.status}`,
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to modify student status', errors: [error.message] });
  }
};
