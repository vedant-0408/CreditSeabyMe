// src/models/LoanApplication.ts
import mongoose, { Document, Schema } from 'mongoose';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
}

export interface ILoanApplication extends Document {
  applicantName: string;
  email: string;
  phone?: string; // Made optional with ?
  loanAmount: number;
  loanTenure: number; // Added field
  employmentStatus: string; // Added field
  employmentAddress: string; // Added field
  purpose: string;
  status: ApplicationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: false, // Changed from true to false
      trim: true
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 0
    },
    loanTenure: {
      type: Number,
      required: true,
      min: 1
    },
    employmentStatus: {
      type: String,
      required: true,
      trim: true
    },
    employmentAddress: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING
    },    
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
