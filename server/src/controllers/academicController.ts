import { Response } from 'express';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { Subject } from '../models/Subject.js';
import { Faculty } from '../models/Faculty.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

// Departments
export const getDepartments = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const depts = await Department.find({ isActive: true }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: depts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', errors: [error.message] });
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description, headOfDepartment, contactEmail, contactPhone } = req.body;
    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment,
      contactEmail,
      contactPhone,
    });
    await logAudit(req, 'CREATE_DEPARTMENT', 'DEPARTMENT', dept._id.toString());
    res.status(201).json({ success: true, data: dept });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create department', errors: [error.message] });
  }
};

// Courses
export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.query;
    const filter: any = { isActive: true };
    if (department) filter.department = department;

    const courses = await Course.find(filter).populate('department', 'name code').sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', errors: [error.message] });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, degree, department, durationYears, totalSemesters } = req.body;
    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      degree,
      department,
      durationYears: durationYears || 4,
      totalSemesters: totalSemesters || 8,
    });
    await logAudit(req, 'CREATE_COURSE', 'COURSE', course._id.toString());
    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create course', errors: [error.message] });
  }
};

// Subjects
export const getSubjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, course, semester } = req.query;
    const filter: any = { isActive: true };
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (semester) filter.semester = Number(semester);

    const subjects = await Subject.find(filter)
      .populate('department', 'name code')
      .populate('course', 'name code degree')
      .sort({ semester: 1, name: 1 })
      .lean();

    res.status(200).json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', errors: [error.message] });
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, department, course, semester, credits, type, maxInternalMarks, maxExternalMarks } =
      req.body;
    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      department,
      course,
      semester,
      credits: credits || 3,
      type: type || 'THEORY',
      maxInternalMarks: maxInternalMarks || 40,
      maxExternalMarks: maxExternalMarks || 60,
      totalMarks: (maxInternalMarks || 40) + (maxExternalMarks || 60),
    });
    await logAudit(req, 'CREATE_SUBJECT', 'SUBJECT', subject._id.toString());
    res.status(201).json({ success: true, data: subject });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create subject', errors: [error.message] });
  }
};

// Faculty
export const getFaculty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.query;
    const filter: any = { isActive: true };
    if (department) filter.department = department;

    const facultyList = await Faculty.find(filter)
      .populate('department', 'name code')
      .populate('user', 'name email avatar lastLogin')
      .populate('assignedClasses.subject', 'name code credits')
      .sort({ designation: 1 })
      .lean();

    res.status(200).json({ success: true, data: facultyList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch faculty list', errors: [error.message] });
  }
};

export const createFaculty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, employeeId, department, designation, qualification, phone, cabinNumber, password } =
      req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User already exists with this email.' });
      return;
    }

    const facultyUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Faculty@123',
      role: 'FACULTY',
      phone,
      isActive: true,
    });

    const faculty = await Faculty.create({
      employeeId: employeeId.toUpperCase(),
      user: facultyUser._id,
      department,
      designation,
      qualification,
      phone,
      email: email.toLowerCase(),
      cabinNumber: cabinNumber || '',
    });

    facultyUser.facultyRef = faculty._id;
    await facultyUser.save();

    await logAudit(req, 'CREATE_FACULTY', 'FACULTY', faculty._id.toString());

    res.status(201).json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create faculty member', errors: [error.message] });
  }
};
