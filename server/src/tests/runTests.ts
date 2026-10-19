import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../app.js';
import { Server } from 'http';

const PORT = 5001; // separate test port

async function runAllTests() {
  console.log('====================================================');
  console.log('  STARTING AUTOMATED SECURITY & RBAC AUDIT SUITE');
  console.log('====================================================');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_infotainment';
  await mongoose.connect(mongoUri);

  const server: Server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  let passedCount = 0;
  let failedCount = 0;

  async function assertTest(name: string, fn: () => Promise<boolean>) {
    try {
      const success = await fn();
      if (success) {
        console.log(`  [PASS] ${name}`);
        passedCount++;
      } else {
        console.error(`  [FAIL] ${name}`);
        failedCount++;
      }
    } catch (e: any) {
      console.error(`  [FAIL] ${name} - Exception:`, e.message);
      failedCount++;
    }
  }

  try {
    // 1. Health check
    await assertTest('Health check /health returns 200 UP', async () => {
      const res = await fetch(`http://localhost:${PORT}/health`);
      const json: any = await res.json();
      return res.status === 200 && json.status === 'UP';
    });

    // 2. Admin Login
    let adminToken = '';
    await assertTest('Admin login succeeds with JWT token', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin@studentinfotainment.local',
          password: 'Admin@123',
        }),
      });
      const json: any = await res.json();
      if (res.status === 200 && json.data?.token) {
        adminToken = json.data.token;
        return true;
      }
      return false;
    });

    // 3. Student Login with Student ID (Roll Number)
    let studentAToken = '';
    let studentAId = '';
    await assertTest('Student login succeeds with Roll Number "25B21AI024"', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '25B21AI024',
          password: 'Student@123',
        }),
      });
      const json: any = await res.json();
      if (res.status === 200 && json.data?.token) {
        studentAToken = json.data.token;
        studentAId = json.data.user.studentId;
        return true;
      }
      return false;
    });

    // 4. Student B Login
    let studentBToken = '';
    let studentBId = '';
    await assertTest('Student B login succeeds with "23B21CS001"', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '23B21CS001',
          password: 'Student@123',
        }),
      });
      const json: any = await res.json();
      if (res.status === 200 && json.data?.token) {
        studentBToken = json.data.token;
        studentBId = json.data.user.studentId;
        return true;
      }
      return false;
    });

    // 5. RBAC Isolation: Student A queries their OWN 360 Profile -> 200 OK
    await assertTest('Student A CAN access their own Student 360 profile', async () => {
      const res = await fetch(`${baseUrl}/students/${studentAId}`, {
        headers: { Authorization: `Bearer ${studentAToken}` },
      });
      const json: any = await res.json();
      return res.status === 200 && json.success === true && json.data?.student?._id === studentAId;
    });

    // 6. Critical Security Test: Student A tries to access Student B's profile -> MUST BE 403 FORBIDDEN!
    await assertTest('SECURITY: Student A is BLOCKED (403 Forbidden) from accessing Student B profile', async () => {
      const res = await fetch(`${baseUrl}/students/${studentBId}`, {
        headers: { Authorization: `Bearer ${studentAToken}` },
      });
      return res.status === 403;
    });

    // 7. Admin queries Student B's profile -> 200 OK
    await assertTest('ADMIN has institutional clearance to access Student B profile', async () => {
      const res = await fetch(`${baseUrl}/students/${studentBId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.status === 200;
    });

    // 8. Public Certificate Verification
    await assertTest('PUBLIC VERIFICATION: Certificate CERT-2026-AITS-10294 verified without token', async () => {
      const res = await fetch(`${baseUrl}/certificates/verify/CERT-2026-AITS-10294`);
      const json: any = await res.json();
      return res.status === 200 && json.data?.certificateNumber === 'CERT-2026-AITS-10294';
    });

    // 9. Global Search Test
    await assertTest('GLOBAL SEARCH: Querying "25B21AI024" finds Sai Praveen', async () => {
      const res = await fetch(`${baseUrl}/search?q=25B21AI024`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json: any = await res.json();
      return res.status === 200 && json.data?.students?.some((s: any) => s.studentId === '25B21AI024');
    });

    // 10. Admin Dashboard Aggregations
    await assertTest('ADMIN DASHBOARD: Retrieves 20 seeded students and Mongo distribution aggregates', async () => {
      const res = await fetch(`${baseUrl}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json: any = await res.json();
      return res.status === 200 && json.data?.metrics?.totalStudents >= 20;
    });
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('====================================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
