export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Student Infotainment — Student 360° Information Management System API',
    version: '1.0.0',
    description:
      'High-performance production REST API providing centralized 360° student lifecycle tracking, attendance evaluation, examination grades, achievements, grievances, documents, and audit logs.',
    contact: {
      name: 'System Architecture Team',
      email: 'admin@studentinfotainment.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'admin@studentinfotainment.local' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user via email, student ID, or employee ID',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current logged-in user and linked student/parent/faculty profile',
        tags: ['Authentication'],
        responses: { 200: { description: 'Profile retrieved' } },
      },
    },
    '/api/students': {
      get: {
        summary: 'List students with server-side pagination, search and filtering',
        tags: ['Students'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'semester', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated student list' } },
      },
      post: {
        summary: 'Enroll new student and generate user credentials',
        tags: ['Students'],
        responses: { 201: { description: 'Student registered' } },
      },
    },
    '/api/students/{id}': {
      get: {
        summary: 'Retrieve Student 360° Comprehensive Profile with full lifecycle data',
        tags: ['Students'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Complete 360 Profile' } },
      },
    },
    '/api/attendance': {
      get: {
        summary: 'Query attendance records',
        tags: ['Attendance'],
        responses: { 200: { description: 'Attendance list' } },
      },
      post: {
        summary: 'Record attendance status',
        tags: ['Attendance'],
        responses: { 200: { description: 'Attendance recorded' } },
      },
    },
    '/api/attendance/bulk': {
      post: {
        summary: 'Bulk record attendance for an entire class roster',
        tags: ['Attendance'],
        responses: { 200: { description: 'Bulk attendance recorded' } },
      },
    },
    '/api/results': {
      get: {
        summary: 'Get semester marks and SGPA/CGPA evaluation',
        tags: ['Results'],
        responses: { 200: { description: 'Results retrieved' } },
      },
      post: {
        summary: 'Evaluate and publish student semester results',
        tags: ['Results'],
        responses: { 200: { description: 'Result published' } },
      },
    },
    '/api/achievements': {
      get: {
        summary: 'List student achievements and awards',
        tags: ['Achievements'],
        responses: { 200: { description: 'Achievements list' } },
      },
      post: {
        summary: 'Submit achievement for verification',
        tags: ['Achievements'],
        responses: { 201: { description: 'Achievement submitted' } },
      },
    },
    '/api/complaints': {
      get: {
        summary: 'Fetch grievances based on user role authorization',
        tags: ['Complaints'],
        responses: { 200: { description: 'Complaints list' } },
      },
      post: {
        summary: 'Submit new student grievance ticket',
        tags: ['Complaints'],
        responses: { 201: { description: 'Ticket created' } },
      },
    },
    '/api/certificates/verify/{certificateNumber}': {
      get: {
        summary: 'Public verification of student certificate authenticity',
        tags: ['Certificates'],
        security: [],
        parameters: [{ name: 'certificateNumber', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Certificate validity verified' } },
      },
    },
    '/api/dashboard/admin': {
      get: {
        summary: 'Admin dashboard KPIs and distribution charts',
        tags: ['Dashboard'],
        responses: { 200: { description: 'Dashboard metrics' } },
      },
    },
  },
};
