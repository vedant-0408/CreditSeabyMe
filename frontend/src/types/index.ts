// src/types/index.ts

// User related types
export enum UserRole {
    VERIFIER = 'verifier',
    ADMIN = 'admin'
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  }
  
  // Application related types
  export enum ApplicationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
    APPROVED = 'approved'
  }
  
  export interface LoanApplication {
    _id: string;
    applicantName: string;
    email: string;
    phone: string;
    loanAmount: number;
    purpose: string;
    status: ApplicationStatus;
    verifiedBy?: {
      _id: string;
      username: string;
    };
    approvedBy?: {
      _id: string;
      username: string;
    };
    rejectedBy?: {
      _id: string;
      username: string;
    };
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Dashboard statistics
  export interface DashboardStats {
    totalApplications: number;
    pendingApplications: number;
    verifiedApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    totalApprovedAmount: number;
    recentApplications: LoanApplication[];
  }
  
  // Auth related types
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  // Form related types
  export interface LoanApplicationFormData {
    applicantName: string;
    email: string;
    phone: string;
    loanAmount: string; // Using string for form input
    purpose: string;
  }
  
  export interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }
  