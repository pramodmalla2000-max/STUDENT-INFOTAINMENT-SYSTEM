import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export interface AuthUserPayload {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  studentId?: string;
  facultyId?: string;
  parentId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any[];
}
