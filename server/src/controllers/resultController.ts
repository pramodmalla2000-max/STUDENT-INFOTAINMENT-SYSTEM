import { Response } from 'express';
import mongoose from 'mongoose';
import { Result } from '../models/Result.js';
import { Student } from '../models/Student.js';
import { Subject } from '../models/Subject.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAudit } from '../utils/audit.js';

const calculateGradeAndPoint = (totalPercentage: number) => {
  if (totalPercentage >= 90) return { grade: 'O', gradePoint: 10 };
  if (totalPercentage >= 80) return { grade: 'A+', gradePoint: 9 };
  if (totalPercentage >= 70) return { grade: 'A', gradePoint: 8 };
  if (totalPercentage >= 60) return { grade: 'B+', gradePoint: 7 };
  if (totalPercentage >= 50) return { grade: 'B', gradePoint: 6 };
  if (totalPercentage >= 40) return { grade: 'C', gradePoint: 5 };
  return { grade: 'F', gradePoint: 0 };
};

export const getResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, semester, academicYear } = req.query;

    const filter: any = {};

    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.student = studentId;
      } else {
        const s = await Student.findOne({ studentId: String(studentId).toUpperCase() });
        if (s) filter.student = s._id;
      }
    }

    if (semester) filter.semester = Number(semester);
    if (academicYear) filter.academicYear = academicYear;

    const results = await Result.find(filter)
      .populate('student', 'studentId rollNumber personalInfo.fullName personalInfo.email academicInfo')
      .populate('subjects.subject', 'name code credits type')
      .sort({ semester: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch results', errors: [error.message] });
  }
};

export const addOrUpdateResult = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { student, semester, academicYear, subjects, remarks } = req.body;

    if (!student || !semester || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ success: false, message: 'Student, semester and subjects array are required.' });
      return;
    }

    let totalMarks = 0;
    let maxTotalMarks = 0;
    let totalCredits = 0;
    let creditsEarned = 0;
    let weightedPointsSum = 0;
    let hasFail = false;

    const processedSubjects = [];

    for (const item of subjects) {
      const subjectDoc = await Subject.findById(item.subject);
      const credits = item.credits || subjectDoc?.credits || 3;
      const maxMarks = item.maxMarks || 100;
      const internalMarks = Number(item.internalMarks || 0);
      const externalMarks = Number(item.externalMarks || 0);
      const subjectTotal = internalMarks + externalMarks;

      const percentage = (subjectTotal / maxMarks) * 100;
      const { grade, gradePoint } = calculateGradeAndPoint(percentage);
      const isPass = grade !== 'F';

      if (!isPass) hasFail = true;

      totalMarks += subjectTotal;
      maxTotalMarks += maxMarks;
      totalCredits += credits;
      if (isPass) {
        creditsEarned += credits;
        weightedPointsSum += gradePoint * credits;
      }

      processedSubjects.push({
        subject: item.subject,
        subjectCode: item.subjectCode || subjectDoc?.code || 'SUB',
        subjectName: item.subjectName || subjectDoc?.name || 'Subject',
        internalMarks,
        externalMarks,
        totalMarks: subjectTotal,
        maxMarks,
        grade,
        gradePoint,
        credits,
        status: isPass ? 'PASS' : 'FAIL',
      });
    }

    const sgpa = totalCredits > 0 ? Number((weightedPointsSum / totalCredits).toFixed(2)) : 0;
    const overallPercentage = maxTotalMarks > 0 ? Number(((totalMarks / maxTotalMarks) * 100).toFixed(1)) : 0;

    const result = await Result.findOneAndUpdate(
      { student, semester },
      {
        student,
        semester,
        academicYear: academicYear || '2025-2026',
        subjects: processedSubjects,
        sgpa,
        cgpa: sgpa, // will be recalculated cumulatively below
        totalCredits,
        creditsEarned,
        totalMarks,
        maxTotalMarks,
        percentage: overallPercentage,
        status: hasFail ? 'FAIL' : 'PASS',
        declaredDate: new Date(),
        publishedBy: req.user?.userId,
        remarks: remarks || '',
      },
      { upsert: true, new: true }
    );

    // Recalculate Student Cumulative CGPA across all declared semesters
    const allStudentResults = await Result.find({ student }).lean();
    let totalSgpaSum = 0;
    let totalCreditsAccumulated = 0;
    let backlogsCount = 0;

    allStudentResults.forEach((r) => {
      totalSgpaSum += r.sgpa * r.totalCredits;
      totalCreditsAccumulated += r.totalCredits;
      r.subjects.forEach((s) => {
        if (s.status === 'FAIL') backlogsCount++;
      });
    });

    const cumulativeCgpa =
      totalCreditsAccumulated > 0 ? Number((totalSgpaSum / totalCreditsAccumulated).toFixed(2)) : sgpa;

    await Student.findByIdAndUpdate(student, {
      currentCgpa: cumulativeCgpa,
      totalCreditsEarned: totalCreditsAccumulated,
      activeBacklogs: backlogsCount,
    });

    // Notify Student and Parent
    const studentDoc = await Student.findById(student).populate('user parentUser');
    if (studentDoc?.user) {
      await Notification.create({
        user: studentDoc.user,
        title: `Semester ${semester} Results Published`,
        message: `Your results for Semester ${semester} are available. SGPA: ${sgpa}.`,
        type: hasFail ? 'WARNING' : 'SUCCESS',
        link: `/student/results`,
      });
    }

    if (studentDoc?.parentUser) {
      await Notification.create({
        user: studentDoc.parentUser,
        title: `Semester ${semester} Results for ${studentDoc.personalInfo.fullName}`,
        message: `Results announced for ${studentDoc.personalInfo.fullName}. SGPA: ${sgpa}, Status: ${
          hasFail ? 'Needs Attention' : 'Passed'
        }.`,
        type: 'INFO',
        link: `/parent/results`,
      });
    }

    await logAudit(req, 'PUBLISH_RESULT', 'RESULT', result._id.toString(), {
      student,
      semester,
      sgpa,
    });

    res.status(200).json({
      success: true,
      message: 'Result evaluated and published successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record result', errors: [error.message] });
  }
};
