import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  STUDENT INFOTAINMENT 360° BACKEND ONLINE`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  API Base: http://localhost:${PORT}/api`);
      console.log(`  Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`  Health Check: http://localhost:${PORT}/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start Student Infotainment server:', err);
    process.exit(1);
  }
};

startServer();
