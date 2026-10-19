import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { Subject } from '../models/Subject.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Faculty } from '../models/Faculty.js';
import { Attendance } from '../models/Attendance.js';
import { Result } from '../models/Result.js';
import { Achievement } from '../models/Achievement.js';
import { Certificate } from '../models/Certificate.js';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { Placement } from '../models/Placement.js';
import { DisciplinaryRecord } from '../models/DisciplinaryRecord.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/SystemSetting.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_infotainment';

export const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully. Purging existing collections...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Student.deleteMany({}),
      Parent.deleteMany({}),
      Faculty.deleteMany({}),
      Attendance.deleteMany({}),
      Result.deleteMany({}),
      Achievement.deleteMany({}),
      Certificate.deleteMany({}),
      Complaint.deleteMany({}),
      Notification.deleteMany({}),
      Placement.deleteMany({}),
      DisciplinaryRecord.deleteMany({}),
      AuditLog.deleteMany({}),
      SystemSetting.deleteMany({}),
    ]);

    console.log('[Seed] Collections cleared. Creating System Settings...');

    await SystemSetting.create([
      {
        key: 'COLLEGE_NAME',
        value: 'Apex Institute of Technology & Science',
        category: 'GENERAL',
        description: 'University Institution Name',
      },
      {
        key: 'COLLEGE_CODE',
        value: 'AITS',
        category: 'GENERAL',
        description: 'Institutional Code',
      },
      {
        key: 'ATTENDANCE_WARNING_THRESHOLD',
        value: 75,
        category: 'ATTENDANCE',
        description: 'Mandatory minimum attendance percentage required to sit for examinations',
      },
      {
        key: 'CGPA_HONORS_THRESHOLD',
        value: 8.5,
        category: 'ACADEMIC',
        description: 'Threshold for Academic Distinction / Honors Dean List',
      },
      {
        key: 'CURRENT_ACADEMIC_YEAR',
        value: '2025-2026',
        category: 'ACADEMIC',
        description: 'Active Academic Session',
      },
    ]);

    console.log('[Seed] Creating Departments...');
    const departmentsData = [
      {
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'Department of Computing, Systems, and Software Engineering',
        headOfDepartment: 'Dr. Ramesh Sharma, Ph.D (IIT Madras)',
        contactEmail: 'hod.cse@aits.ac.in',
        contactPhone: '+91 98480 12345',
      },
      {
        name: 'Artificial Intelligence and Machine Learning',
        code: 'AIML',
        description: 'Next-generation Intelligent Systems, Deep Learning and Robotics',
        headOfDepartment: 'Dr. Sunita Deshmukh, Ph.D (IISc Bangalore)',
        contactEmail: 'hod.aiml@aits.ac.in',
        contactPhone: '+91 98480 23456',
      },
      {
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        description: 'Embedded Systems, VLSI, Signal Processing and Communications',
        headOfDepartment: 'Dr. K. V. Raman, Ph.D (NIT Warangal)',
        contactEmail: 'hod.ece@aits.ac.in',
        contactPhone: '+91 98480 34567',
      },
      {
        name: 'Electrical and Electronics Engineering',
        code: 'EEE',
        description: 'Power Systems, Renewable Energy, and Electric Drives',
        headOfDepartment: 'Dr. Meenakshi Sundaram, Ph.D',
        contactEmail: 'hod.eee@aits.ac.in',
        contactPhone: '+91 98480 45678',
      },
      {
        name: 'Mechanical Engineering',
        code: 'MECH',
        description: 'Thermodynamics, Robotics, CAD/CAM and Automotive Engineering',
        headOfDepartment: 'Dr. Rajeshwar Rao, Ph.D',
        contactEmail: 'hod.mech@aits.ac.in',
        contactPhone: '+91 98480 56789',
      },
      {
        name: 'Civil Engineering',
        code: 'CIVIL',
        description: 'Structural Analysis, Geotechnical and Environmental Engineering',
        headOfDepartment: 'Dr. Ananya Roy, Ph.D',
        contactEmail: 'hod.civil@aits.ac.in',
        contactPhone: '+91 98480 67890',
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Cloud Infrastructure, Web Technologies, and Cyber Security',
        headOfDepartment: 'Dr. Arvind Krishna, Ph.D',
        contactEmail: 'hod.it@aits.ac.in',
        contactPhone: '+91 98480 78901',
      },
    ];

    const departments = await Department.create(departmentsData);
    const cseDept = departments.find((d) => d.code === 'CSE')!;
    const aimlDept = departments.find((d) => d.code === 'AIML')!;
    const eceDept = departments.find((d) => d.code === 'ECE')!;
    const itDept = departments.find((d) => d.code === 'IT')!;

    console.log('[Seed] Creating Courses...');
    const courses = await Course.create([
      {
        name: 'Bachelor of Technology in Computer Science and Engineering',
        code: 'BTECH-CSE',
        degree: 'B.Tech',
        department: cseDept._id,
        durationYears: 4,
        totalSemesters: 8,
      },
      {
        name: 'Bachelor of Technology in Artificial Intelligence and Machine Learning',
        code: 'BTECH-AIML',
        degree: 'B.Tech',
        department: aimlDept._id,
        durationYears: 4,
        totalSemesters: 8,
      },
      {
        name: 'Bachelor of Technology in Electronics and Communication',
        code: 'BTECH-ECE',
        degree: 'B.Tech',
        department: eceDept._id,
        durationYears: 4,
        totalSemesters: 8,
      },
      {
        name: 'Bachelor of Technology in Information Technology',
        code: 'BTECH-IT',
        degree: 'B.Tech',
        department: itDept._id,
        durationYears: 4,
        totalSemesters: 8,
      },
    ]);

    const cseCourse = courses.find((c) => c.code === 'BTECH-CSE')!;
    const aimlCourse = courses.find((c) => c.code === 'BTECH-AIML')!;

    console.log('[Seed] Creating Core Curriculum Subjects...');
    const subjects = await Subject.create([
      {
        name: 'Data Structures and Algorithms',
        code: 'CS301',
        department: cseDept._id,
        course: cseCourse._id,
        semester: 3,
        credits: 4,
        type: 'THEORY',
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      },
      {
        name: 'Database Management Systems',
        code: 'CS302',
        department: cseDept._id,
        course: cseCourse._id,
        semester: 3,
        credits: 4,
        type: 'THEORY',
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      },
      {
        name: 'Operating Systems & Architecture',
        code: 'CS401',
        department: cseDept._id,
        course: cseCourse._id,
        semester: 4,
        credits: 4,
        type: 'THEORY',
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      },
      {
        name: 'Machine Learning Foundations',
        code: 'AI402',
        department: aimlDept._id,
        course: aimlCourse._id,
        semester: 4,
        credits: 4,
        type: 'THEORY',
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      },
      {
        name: 'Deep Learning & Neural Networks',
        code: 'AI501',
        department: aimlDept._id,
        course: aimlCourse._id,
        semester: 5,
        credits: 4,
        type: 'THEORY',
        maxInternalMarks: 40,
        maxExternalMarks: 60,
      },
      {
        name: 'Full Stack Web Engineering Lab',
        code: 'CS502L',
        department: cseDept._id,
        course: cseCourse._id,
        semester: 5,
        credits: 2,
        type: 'LAB',
        maxInternalMarks: 50,
        maxExternalMarks: 50,
      },
    ]);

    console.log('[Seed] Creating Administrative Users...');
    const superAdminUser = await User.create({
      name: 'Dr. Vikramaditya Singhania',
      email: 'superadmin@studentinfotainment.local',
      password: 'SuperAdmin@123',
      role: 'SUPER_ADMIN',
      phone: '+91 99000 00001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
    });

    const adminUser = await User.create({
      name: 'Dean Academic Affairs (Admin)',
      email: 'admin@studentinfotainment.local',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+91 99000 00002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
    });

    console.log('[Seed] Creating 5 Faculty Members...');
    const facultyProfiles = [
      {
        name: 'Prof. Ananth Narayanan',
        email: 'faculty@studentinfotainment.local', // primary demo faculty
        employeeId: 'FAC-CSE-001',
        designation: 'Professor & Head',
        qualification: 'Ph.D in AI & Algorithms (IIT Delhi)',
        experienceYears: 16,
        cabinNumber: 'CSE Block Room 304',
        department: cseDept._id,
      },
      {
        name: 'Dr. Radhika Iyer',
        email: 'radhika.iyer@aits.ac.in',
        employeeId: 'FAC-AIML-002',
        designation: 'Associate Professor',
        qualification: 'Ph.D in Machine Learning (IISc)',
        experienceYears: 10,
        cabinNumber: 'AIML Center Room 102',
        department: aimlDept._id,
      },
      {
        name: 'Prof. Senthil Kumar',
        email: 'senthil.kumar@aits.ac.in',
        employeeId: 'FAC-ECE-003',
        designation: 'Assistant Professor (Senior)',
        qualification: 'M.Tech, Ph.D (NIT Trichy)',
        experienceYears: 8,
        cabinNumber: 'ECE Block Room 208',
        department: eceDept._id,
      },
      {
        name: 'Dr. Kavita Reddy',
        email: 'kavita.reddy@aits.ac.in',
        employeeId: 'FAC-CSE-004',
        designation: 'Assistant Professor',
        qualification: 'Ph.D in Distributed Systems',
        experienceYears: 6,
        cabinNumber: 'CSE Block Room 112',
        department: cseDept._id,
      },
      {
        name: 'Prof. Manoj Varma',
        email: 'manoj.varma@aits.ac.in',
        employeeId: 'FAC-IT-005',
        designation: 'Associate Professor',
        qualification: 'Ph.D in Cybersecurity',
        experienceYears: 12,
        cabinNumber: 'IT Block Room 401',
        department: itDept._id,
      },
    ];

    const createdFaculty = [];
    for (const fp of facultyProfiles) {
      const fUser = await User.create({
        name: fp.name,
        email: fp.email,
        password: 'Faculty@123',
        role: 'FACULTY',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        isActive: true,
      });

      const facultyDoc = await Faculty.create({
        employeeId: fp.employeeId,
        user: fUser._id,
        department: fp.department,
        designation: fp.designation,
        qualification: fp.qualification,
        experienceYears: fp.experienceYears,
        cabinNumber: fp.cabinNumber,
        phone: '+91 98765 43210',
        email: fp.email,
        assignedClasses: [
          {
            subject: subjects[0]._id,
            department: fp.department,
            course: cseCourse._id,
            semester: 3,
            section: 'A',
          },
          {
            subject: subjects[1]._id,
            department: fp.department,
            course: cseCourse._id,
            semester: 3,
            section: 'B',
          },
        ],
      });

      fUser.facultyRef = facultyDoc._id;
      await fUser.save();
      createdFaculty.push(facultyDoc);
    }

    console.log('[Seed] Creating 20 Realistic Indian University Students & Parents...');
    const studentsSeedData = [
      {
        firstName: 'Sai',
        lastName: 'Praveen',
        gender: 'MALE',
        studentId: '25B21AI024',
        rollNumber: '25B21AI024',
        admissionNumber: 'ADM-2023-01024',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 9.38,
        attendance: 94.5,
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Srinivas Varma',
        mother: 'Padmavathi Varma',
        email: 'student@studentinfotainment.local', // primary demo student
        parentEmail: 'parent@studentinfotainment.local', // primary demo parent
        placement: {
          status: 'PLACED',
          company: 'Google India',
          packageLPA: 38.5,
          role: 'Software Engineer - AI/ML',
          placementDate: new Date('2026-08-15'),
          internshipCompany: 'Amazon Web Services',
          internshipStipend: 85000,
        },
      },
      {
        firstName: 'Aarav',
        lastName: 'Sharma',
        gender: 'MALE',
        studentId: '23B21CS001',
        rollNumber: '23B21CS001',
        admissionNumber: 'ADM-2023-01001',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.92,
        attendance: 88.0,
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Mukesh Sharma',
        mother: 'Rekha Sharma',
        email: 'aarav.sharma@student.aits.ac.in',
        parentEmail: 'mukesh.sharma@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Microsoft IDC',
          packageLPA: 42.0,
          role: 'Software Development Engineer',
        },
      },
      {
        firstName: 'Diya',
        lastName: 'Menon',
        gender: 'FEMALE',
        studentId: '23B21CS042',
        rollNumber: '23B21CS042',
        admissionNumber: 'ADM-2023-01042',
        dept: cseDept,
        course: cseCourse,
        cgpa: 9.15,
        attendance: 96.0,
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Venugopal Menon',
        mother: 'Lakshmi Menon',
        email: 'diya.menon@student.aits.ac.in',
        parentEmail: 'venu.menon@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Uber Technologies',
          packageLPA: 35.0,
          role: 'Backend Systems Engineer',
        },
      },
      {
        firstName: 'Rohan',
        lastName: 'Kulkarni',
        gender: 'MALE',
        studentId: '24B21AI015',
        rollNumber: '24B21AI015',
        admissionNumber: 'ADM-2024-02015',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 7.24,
        attendance: 68.5, // low attendance demonstration!
        semester: 3,
        year: 2,
        section: 'B',
        father: 'Suresh Kulkarni',
        mother: 'Shailaja Kulkarni',
        email: 'rohan.kulkarni@student.aits.ac.in',
        parentEmail: 'suresh.kulkarni@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Ananya',
        lastName: 'Chatterjee',
        gender: 'FEMALE',
        studentId: '23B21CS088',
        rollNumber: '23B21CS088',
        admissionNumber: 'ADM-2023-01088',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.65,
        attendance: 91.2,
        semester: 5,
        year: 3,
        section: 'B',
        father: 'Debabrata Chatterjee',
        mother: 'Soma Chatterjee',
        email: 'ananya.chatterjee@student.aits.ac.in',
        parentEmail: 'debabrata.c@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Goldman Sachs',
          packageLPA: 28.0,
          role: 'Quantitative Analyst Intern',
        },
      },
      {
        firstName: 'Karthik',
        lastName: 'Balasubramanian',
        gender: 'MALE',
        studentId: '22B21CS019',
        rollNumber: '22B21CS019',
        admissionNumber: 'ADM-2022-00019',
        dept: cseDept,
        course: cseCourse,
        cgpa: 9.72,
        attendance: 98.4,
        semester: 7,
        year: 4,
        section: 'A',
        father: 'Balasubramanian K.',
        mother: 'Geetha Bala',
        email: 'karthik.bala@student.aits.ac.in',
        parentEmail: 'bala.k@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'DE Shaw & Co',
          packageLPA: 51.5,
          role: 'Member Technical Staff',
        },
      },
      {
        firstName: 'Sneha',
        lastName: 'Patel',
        gender: 'FEMALE',
        studentId: '24B21CS034',
        rollNumber: '24B21CS034',
        admissionNumber: 'ADM-2024-02034',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.42,
        attendance: 84.0,
        semester: 3,
        year: 2,
        section: 'A',
        father: 'Bhupendra Patel',
        mother: 'Kiran Patel',
        email: 'sneha.patel@student.aits.ac.in',
        parentEmail: 'bhupendra.p@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Aditya',
        lastName: 'Verma',
        gender: 'MALE',
        studentId: '23B21AI044',
        rollNumber: '23B21AI044',
        admissionNumber: 'ADM-2023-01044',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 6.40, // low cgpa demonstration!
        attendance: 72.0, // low attendance demonstration!
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Harish Verma',
        mother: 'Kavita Verma',
        email: 'aditya.verma@student.aits.ac.in',
        parentEmail: 'harish.verma@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Meera',
        lastName: 'Nambiar',
        gender: 'FEMALE',
        studentId: '24B21AI062',
        rollNumber: '24B21AI062',
        admissionNumber: 'ADM-2024-02062',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 8.78,
        attendance: 90.0,
        semester: 3,
        year: 2,
        section: 'B',
        father: 'Raghavan Nambiar',
        mother: 'Malini Nambiar',
        email: 'meera.nambiar@student.aits.ac.in',
        parentEmail: 'raghavan.n@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Vikram',
        lastName: 'Rathore',
        gender: 'MALE',
        studentId: '22B21CS099',
        rollNumber: '22B21CS099',
        admissionNumber: 'ADM-2022-00099',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.10,
        attendance: 82.5,
        semester: 7,
        year: 4,
        section: 'B',
        father: 'Gajendra Singh Rathore',
        mother: 'Sunita Rathore',
        email: 'vikram.rathore@student.aits.ac.in',
        parentEmail: 'gajendra.r@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Oracle India',
          packageLPA: 22.0,
          role: 'Cloud Infrastructure Associate',
        },
      },
      {
        firstName: 'Pooja',
        lastName: 'Hegde',
        gender: 'FEMALE',
        studentId: '25B21CS011',
        rollNumber: '25B21CS011',
        admissionNumber: 'ADM-2025-03011',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.95,
        attendance: 93.0,
        semester: 1,
        year: 1,
        section: 'A',
        father: 'Ramakrishna Hegde',
        mother: 'Sudha Hegde',
        email: 'pooja.hegde@student.aits.ac.in',
        parentEmail: 'ramakrishna.h@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Siddharth',
        lastName: 'Gupta',
        gender: 'MALE',
        studentId: '23B21CS056',
        rollNumber: '23B21CS056',
        admissionNumber: 'ADM-2023-01056',
        dept: cseDept,
        course: cseCourse,
        cgpa: 8.52,
        attendance: 87.5,
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Vinod Gupta',
        mother: 'Neelam Gupta',
        email: 'siddharth.gupta@student.aits.ac.in',
        parentEmail: 'vinod.gupta@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Cisco Systems',
          packageLPA: 24.5,
          role: 'Network Software Engineer',
        },
      },
      {
        firstName: 'Tanvi',
        lastName: 'Deshmukh',
        gender: 'FEMALE',
        studentId: '24B21AI033',
        rollNumber: '24B21AI033',
        admissionNumber: 'ADM-2024-02033',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 9.05,
        attendance: 95.0,
        semester: 3,
        year: 2,
        section: 'A',
        father: 'Arun Deshmukh',
        mother: 'Chitra Deshmukh',
        email: 'tanvi.deshmukh@student.aits.ac.in',
        parentEmail: 'arun.deshmukh@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Nikhil',
        lastName: 'Prasad',
        gender: 'MALE',
        studentId: '23B21CS077',
        rollNumber: '23B21CS077',
        admissionNumber: 'ADM-2023-01077',
        dept: cseDept,
        course: cseCourse,
        cgpa: 7.90,
        attendance: 81.0,
        semester: 5,
        year: 3,
        section: 'B',
        father: 'Janardhan Prasad',
        mother: 'Usha Prasad',
        email: 'nikhil.prasad@student.aits.ac.in',
        parentEmail: 'janardhan.p@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'TCS Digital',
          packageLPA: 9.0,
          role: 'Systems Engineer',
        },
      },
      {
        firstName: 'Rhea',
        lastName: 'D’Souza',
        gender: 'FEMALE',
        studentId: '23B21CS102',
        rollNumber: '23B21CS102',
        admissionNumber: 'ADM-2023-01102',
        dept: cseDept,
        course: cseCourse,
        cgpa: 9.20,
        attendance: 92.5,
        semester: 5,
        year: 3,
        section: 'A',
        father: 'Francis D’Souza',
        mother: 'Maria D’Souza',
        email: 'rhea.dsouza@student.aits.ac.in',
        parentEmail: 'francis.dsouza@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'JPMorgan Chase & Co',
          packageLPA: 26.0,
          role: 'Software Analyst',
        },
      },
      {
        firstName: 'Varun',
        lastName: 'Reddy',
        gender: 'MALE',
        studentId: '24B21CS050',
        rollNumber: '24B21CS050',
        admissionNumber: 'ADM-2024-02050',
        dept: cseDept,
        course: cseCourse,
        cgpa: 7.60,
        attendance: 76.0,
        semester: 3,
        year: 2,
        section: 'A',
        father: 'Prabhakar Reddy',
        mother: 'Sujatha Reddy',
        email: 'varun.reddy@student.aits.ac.in',
        parentEmail: 'prabhakar.reddy@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Ishita',
        lastName: 'Bose',
        gender: 'FEMALE',
        studentId: '25B21AI008',
        rollNumber: '25B21AI008',
        admissionNumber: 'ADM-2025-03008',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 8.80,
        attendance: 91.0,
        semester: 1,
        year: 1,
        section: 'A',
        father: 'Subhash Bose',
        mother: 'Maitreyi Bose',
        email: 'ishita.bose@student.aits.ac.in',
        parentEmail: 'subhash.bose@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Manoj',
        lastName: 'Kumar',
        gender: 'MALE',
        studentId: '22B21CS035',
        rollNumber: '22B21CS035',
        admissionNumber: 'ADM-2022-00035',
        dept: cseDept,
        course: cseCourse,
        cgpa: 7.45,
        attendance: 79.5,
        semester: 7,
        year: 4,
        section: 'B',
        father: 'Shankar Kumar',
        mother: 'Girija Kumar',
        email: 'manoj.kumar@student.aits.ac.in',
        parentEmail: 'shankar.kumar@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Infosys Limited',
          packageLPA: 9.5,
          role: 'Specialist Programmer',
        },
      },
      {
        firstName: 'Anusha',
        lastName: 'Rao',
        gender: 'FEMALE',
        studentId: '24B21CS085',
        rollNumber: '24B21CS085',
        admissionNumber: 'ADM-2024-02085',
        dept: cseDept,
        course: cseCourse,
        cgpa: 9.40,
        attendance: 97.0,
        semester: 3,
        year: 2,
        section: 'A',
        father: 'Nagaraj Rao',
        mother: 'Suma Rao',
        email: 'anusha.rao@student.aits.ac.in',
        parentEmail: 'nagaraj.rao@parent.aits.ac.in',
        placement: { status: 'UNPLACED' },
      },
      {
        firstName: 'Harish',
        lastName: 'Pandey',
        gender: 'MALE',
        studentId: '23B21AI090',
        rollNumber: '23B21AI090',
        admissionNumber: 'ADM-2023-01090',
        dept: aimlDept,
        course: aimlCourse,
        cgpa: 8.35,
        attendance: 86.0,
        semester: 5,
        year: 3,
        section: 'B',
        father: 'Omkar Pandey',
        mother: 'Sarita Pandey',
        email: 'harish.pandey@student.aits.ac.in',
        parentEmail: 'omkar.pandey@parent.aits.ac.in',
        placement: {
          status: 'PLACED',
          company: 'Wipro Digital',
          packageLPA: 8.5,
          role: 'Project Engineer',
        },
      },
    ];

    const createdStudents = [];
    const createdParents = [];

    for (const item of studentsSeedData) {
      const fullName = `${item.firstName} ${item.lastName}`;

      // 1. Create Student User
      const sUser = await User.create({
        name: fullName,
        email: item.email,
        password: 'Student@123',
        role: 'STUDENT',
        phone: '+91 91234 56789',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.firstName}`,
        isActive: true,
      });

      // 2. Create Parent User
      const pUser = await User.create({
        name: item.father,
        email: item.parentEmail,
        password: 'Parent@123',
        role: 'PARENT',
        phone: '+91 98450 11223',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.father}`,
        isActive: true,
      });

      // 3. Create Student Document
      const studentDoc = await Student.create({
        studentId: item.studentId,
        rollNumber: item.rollNumber,
        admissionNumber: item.admissionNumber,
        user: sUser._id,
        parentUser: pUser._id,
        personalInfo: {
          firstName: item.firstName,
          lastName: item.lastName,
          fullName,
          dob: new Date('2004-06-15'),
          gender: item.gender as any,
          bloodGroup: 'B+',
          phone: '+91 91234 56789',
          email: item.email,
          address: 'Plot 42, Hitech City Main Road, Cyber Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.firstName}`,
        },
        academicInfo: {
          department: item.dept._id,
          course: item.course._id,
          branch: item.dept.name,
          batch: item.year === 4 ? '2022-2026' : item.year === 3 ? '2023-2027' : item.year === 2 ? '2024-2028' : '2025-2029',
          academicYear: '2025-2026',
          currentSemester: item.semester,
          section: item.section,
          yearOfStudy: item.year,
          admissionDate: new Date('2023-08-01'),
          graduationExpectedDate: new Date('2027-05-30'),
          status: 'ACTIVE',
        },
        parentInfo: {
          fatherName: item.father,
          motherName: item.mother,
          parentEmail: item.parentEmail,
          parentPhone: '+91 98450 11223',
          emergencyContact: '+91 98450 99887',
          relationship: 'Father',
        },
        placementInfo: item.placement as any,
        currentCgpa: item.cgpa,
        totalCreditsEarned: item.semester * 22,
        activeBacklogs: item.cgpa < 7.0 ? 1 : 0,
        overallAttendancePercentage: item.attendance,
        profileCompletionPercentage: 95,
        remarks: 'Consistent student showing high aptitude in technical endeavors.',
      });

      // Link references
      sUser.studentRef = studentDoc._id;
      await sUser.save();

      const parentDoc = await Parent.create({
        user: pUser._id,
        linkedStudents: [studentDoc._id],
        relationship: 'Father',
        occupation: 'Senior Executive / Business Professional',
        phone: '+91 98450 11223',
        email: item.parentEmail,
        emergencyContact: '+91 98450 99887',
        address: 'Cyber Hills, Hyderabad',
      });

      pUser.parentRef = parentDoc._id;
      await pUser.save();

      createdStudents.push(studentDoc);
      createdParents.push(parentDoc);
    }

    console.log('[Seed] Generating Attendance Records...');
    const attendanceDates = [
      new Date('2026-10-01'),
      new Date('2026-10-03'),
      new Date('2026-10-06'),
      new Date('2026-10-08'),
      new Date('2026-10-10'),
      new Date('2026-10-13'),
      new Date('2026-10-15'),
      new Date('2026-10-17'),
    ];

    const attendanceRecords = [];
    for (const s of createdStudents) {
      for (const d of attendanceDates) {
        // High attendance students mostly PRESENT, low attendance students have ABSENT
        const isLow = s.overallAttendancePercentage < 75;
        const statusRandom = Math.random();
        let status = 'PRESENT';
        if (isLow) {
          status = statusRandom < 0.4 ? 'ABSENT' : statusRandom < 0.5 ? 'LATE' : 'PRESENT';
        } else {
          status = statusRandom < 0.88 ? 'PRESENT' : statusRandom < 0.94 ? 'OD' : 'LATE';
        }

        attendanceRecords.push({
          student: s._id,
          subject: subjects[0]._id,
          faculty: createdFaculty[0]._id,
          date: d,
          status,
          semester: s.academicInfo.currentSemester,
          academicYear: '2025-2026',
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);

    console.log('[Seed] Generating Examination Semester Results...');
    for (const s of createdStudents) {
      // Semester 1
      await Result.create({
        student: s._id,
        semester: 1,
        academicYear: '2023-2024',
        subjects: [
          {
            subject: subjects[0]._id,
            subjectCode: 'CS301',
            subjectName: 'Data Structures and Algorithms',
            internalMarks: 36,
            externalMarks: 54,
            totalMarks: 90,
            maxMarks: 100,
            grade: 'O',
            gradePoint: 10,
            credits: 4,
            status: 'PASS',
          },
          {
            subject: subjects[1]._id,
            subjectCode: 'CS302',
            subjectName: 'Database Management Systems',
            internalMarks: 34,
            externalMarks: 50,
            totalMarks: 84,
            maxMarks: 100,
            grade: 'A+',
            gradePoint: 9,
            credits: 4,
            status: 'PASS',
          },
        ],
        sgpa: Number((s.currentCgpa * 0.98).toFixed(2)),
        cgpa: s.currentCgpa,
        totalCredits: 20,
        creditsEarned: 20,
        totalMarks: 174,
        maxTotalMarks: 200,
        percentage: 87.0,
        status: 'PASS',
        declaredDate: new Date('2024-01-20'),
        publishedBy: adminUser._id,
      });

      // Semester 2
      await Result.create({
        student: s._id,
        semester: 2,
        academicYear: '2023-2024',
        subjects: [
          {
            subject: subjects[2]._id,
            subjectCode: 'CS401',
            subjectName: 'Operating Systems & Architecture',
            internalMarks: 35,
            externalMarks: 53,
            totalMarks: 88,
            maxMarks: 100,
            grade: 'A+',
            gradePoint: 9,
            credits: 4,
            status: 'PASS',
          },
          {
            subject: subjects[3]._id,
            subjectCode: 'AI402',
            subjectName: 'Machine Learning Foundations',
            internalMarks: 37,
            externalMarks: 55,
            totalMarks: 92,
            maxMarks: 100,
            grade: 'O',
            gradePoint: 10,
            credits: 4,
            status: 'PASS',
          },
        ],
        sgpa: Number((s.currentCgpa * 1.01 > 10 ? 9.8 : s.currentCgpa * 1.01).toFixed(2)),
        cgpa: s.currentCgpa,
        totalCredits: 22,
        creditsEarned: 22,
        totalMarks: 180,
        maxTotalMarks: 200,
        percentage: 90.0,
        status: 'PASS',
        declaredDate: new Date('2024-06-15'),
        publishedBy: adminUser._id,
      });
    }

    console.log('[Seed] Creating Achievements...');
    const demoStudent = createdStudents[0]; // Sai Praveen
    await Achievement.create([
      {
        student: demoStudent._id,
        title: 'Smart India Hackathon 2025 - Grand Finale Winner',
        category: 'Hackathon',
        description: 'First prize in national Smart India Hackathon solving AI-driven health triage pipeline problem statement.',
        achievementDate: new Date('2025-12-22'),
        organization: 'Ministry of Education & AICTE',
        level: 'National',
        position: '1st Place Winner (₹1,00,000 Cash Prize)',
        verificationStatus: 'VERIFIED',
        verifiedBy: createdFaculty[0]._id,
        verifiedAt: new Date('2025-12-24'),
        verificationRemarks: 'Official certificate & trophy validated by Dean Research.',
      },
      {
        student: demoStudent._id,
        title: 'IEEE International Conference Research Paper',
        category: 'Research',
        description: 'Published paper on "Efficient Transformer Fine-Tuning for Edge Medical Devices" at IEEE INDICON.',
        achievementDate: new Date('2026-02-14'),
        organization: 'IEEE Computer Society',
        level: 'International',
        position: 'Lead Author & Presenter',
        verificationStatus: 'VERIFIED',
        verifiedBy: createdFaculty[1]._id,
        verifiedAt: new Date('2026-02-16'),
        verificationRemarks: 'DOI Indexed in IEEE Xplore verified.',
      },
      {
        student: demoStudent._id,
        title: 'Google Cloud Certified Professional Cloud Architect',
        category: 'Certification',
        description: 'Achieved Google Cloud Professional Architect certification with distinction score.',
        achievementDate: new Date('2026-05-10'),
        organization: 'Google Cloud Platform',
        level: 'International',
        position: 'Certified Professional',
        verificationStatus: 'VERIFIED',
        verifiedBy: createdFaculty[0]._id,
        verifiedAt: new Date('2026-05-12'),
      },
      {
        student: createdStudents[1]._id,
        title: 'Inter-University Chess Championship Gold Medalist',
        category: 'Sports',
        description: 'Secured gold medal representing the university across 28 collegiate teams.',
        achievementDate: new Date('2026-03-05'),
        organization: 'Association of Indian Universities (AIU)',
        level: 'State',
        position: 'Gold Medalist (Board 1)',
        verificationStatus: 'VERIFIED',
        verifiedBy: createdFaculty[2]._id,
      },
      {
        student: createdStudents[3]._id, // Rohan (Pending review)
        title: 'CodeForces Master Candidate',
        category: 'Competition',
        description: 'Achieved 1900+ Rating on CodeForces competitive programming division 1.',
        achievementDate: new Date('2026-09-01'),
        organization: 'CodeForces Global',
        level: 'International',
        position: 'Candidate Master',
        verificationStatus: 'PENDING',
      },
    ]);

    console.log('[Seed] Creating Verifiable Certificates...');
    await Certificate.create([
      {
        student: demoStudent._id,
        certificateNumber: 'CERT-2026-AITS-10294',
        title: 'Dean’s Honor List — Academic Excellence Distinction',
        category: 'Academic Honor',
        issueDate: new Date('2026-01-10'),
        issuingOrganization: 'Apex Institute of Technology & Science',
        status: 'VERIFIED',
        verificationUrl: '/verify/certificate/CERT-2026-AITS-10294',
      },
      {
        student: demoStudent._id,
        certificateNumber: 'CERT-2026-AITS-88391',
        title: 'National Merit Scholar Award in Artificial Intelligence',
        category: 'Scholarship',
        issueDate: new Date('2025-11-20'),
        issuingOrganization: 'Department of Science and Technology (DST)',
        status: 'VERIFIED',
        verificationUrl: '/verify/certificate/CERT-2026-AITS-88391',
      },
      {
        student: createdStudents[1]._id,
        certificateNumber: 'CERT-2026-AITS-77210',
        title: 'Full Stack Cloud Native Architect Fellowship',
        category: 'Technical',
        issueDate: new Date('2026-04-18'),
        issuingOrganization: 'The Linux Foundation',
        status: 'VERIFIED',
        verificationUrl: '/verify/certificate/CERT-2026-AITS-77210',
      },
    ]);

    console.log('[Seed] Creating Grievances / Complaints...');
    await Complaint.create([
      {
        student: demoStudent._id,
        title: 'Laboratory GPU Server Resource Allocation for Deep Learning',
        category: 'Infrastructure',
        description: 'Request for increased vRAM quota on department RTX 4090 cluster for running batch training of final year project models.',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        resolution: 'Approved by Dr. Sunita Deshmukh. SSH key updated and allocated node 4 GPU compute partition.',
        resolvedAt: new Date('2026-09-18'),
        assignedTo: createdFaculty[1]._id,
        history: [
          {
            status: 'OPEN',
            comment: 'Ticket opened by student with workload benchmark logs.',
            updatedBy: demoStudent.user,
            updatedAt: new Date('2026-09-15'),
          },
          {
            status: 'RESOLVED',
            comment: 'GPU server allocation assigned on Node 4.',
            updatedBy: createdFaculty[1].user,
            updatedAt: new Date('2026-09-18'),
          },
        ],
      },
      {
        student: createdStudents[3]._id, // Rohan (low attendance)
        title: 'Attendance Discrepancy Correction due to Medical Quarantine',
        category: 'Academic',
        description: 'Medical certificate submitted for Dengue fever treatment during Oct 1-5; requesting On-Duty status update.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: createdFaculty[0]._id,
        history: [
          {
            status: 'OPEN',
            comment: 'Medical documentation uploaded by parent.',
            updatedBy: createdStudents[3].user,
            updatedAt: new Date('2026-10-12'),
          },
          {
            status: 'IN_PROGRESS',
            comment: 'Under verification with College Medical Officer.',
            updatedBy: createdFaculty[0].user,
            updatedAt: new Date('2026-10-14'),
          },
        ],
      },
    ]);

    console.log('[Seed] Creating Disciplinary Records...');
    await DisciplinaryRecord.create([
      {
        student: createdStudents[7]._id, // Aditya Verma
        incident: 'Late return to campus hostel post permissible curfew time',
        incidentDate: new Date('2026-08-20'),
        description: 'Reported by campus security gate 2 for returning after 10:00 PM without prior warden gatepass authorization.',
        actionTaken: 'First official verbal caution and written undertaking logged with Chief Warden.',
        status: 'RESOLVED',
        reportedBy: adminUser._id,
        resolutionRemarks: 'Undertaking submitted; parents briefed.',
      },
    ]);

    console.log('[Seed] Creating Notifications...');
    // Notification for demo student
    await Notification.create([
      {
        user: demoStudent.user,
        title: 'Placement Offer Confirmed: Google India',
        message: 'Congratulations! Your placement offer letter from Google India (38.5 LPA) has been formally approved by the Career Services Cell.',
        type: 'SUCCESS',
        read: false,
        link: '/student/profile?tab=placement',
      },
      {
        user: demoStudent.user,
        title: 'Semester 4 Results Published',
        message: 'Your official SGPA for Semester 4 is 9.42 with 22 earned credits. You are in the top 1% percentile.',
        type: 'INFO',
        read: true,
        link: '/student/results',
      },
      {
        user: demoStudent.user,
        title: 'Achievement Verified: Smart India Hackathon',
        message: 'Your 1st Place National Hackathon trophy and certificate have been verified by HOD Dr. Ramesh.',
        type: 'SUCCESS',
        read: true,
        link: '/student/achievements',
      },
      // Notification for demo parent
      {
        user: createdParents[0].user,
        title: 'Academic Performance Update: Sai Praveen',
        message: 'Sai Praveen has maintained an outstanding CGPA of 9.38 and attendance of 94.5%.',
        type: 'SUCCESS',
        read: false,
        link: '/parent/dashboard',
      },
    ]);

    console.log('====================================================');
    console.log('  SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('  DEMO CREDENTIALS:');
    console.log('  - Super Admin : superadmin@studentinfotainment.local / SuperAdmin@123');
    console.log('  - Admin       : admin@studentinfotainment.local / Admin@123');
    console.log('  - Faculty     : faculty@studentinfotainment.local / Faculty@123');
    console.log('  - Student     : student@studentinfotainment.local / Student@123 (or Student ID: 25B21AI024)');
    console.log('  - Parent      : parent@studentinfotainment.local / Parent@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
