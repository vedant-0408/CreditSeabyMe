import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import LoanApplication, { ApplicationStatus } from '../models/LoanApplication';
import { authenticate, authorizeVerifier, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Create new loan application (public route)
// Create new loan application (public route)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicantName, email, loanAmount, purpose, loanTenure, employmentStatus, employmentAddress } = req.body;

    const newApplication = new LoanApplication({
      applicantName,
      email,
      loanAmount,
      purpose,
      loanTenure,
      employmentStatus,
      employmentAddress,
      status: ApplicationStatus.PENDING
    });

    await newApplication.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});


// Get all applications with pagination, sorting and filtering
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sort as string] = sortDirection;
    
    const applications = await LoanApplication.find(query)
      .populate('verifiedBy', 'username')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const totalApplications = await LoanApplication.countDocuments(query);
    
    res.json({
      applications,
      pagination: {
        total: totalApplications,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalApplications / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard statistics
router.get('/stats/dashboard', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalApplications = await LoanApplication.countDocuments();
    const pendingApplications = await LoanApplication.countDocuments({ status: ApplicationStatus.PENDING });
    const verifiedApplications = await LoanApplication.countDocuments({ status: ApplicationStatus.VERIFIED });
    const approvedApplications = await LoanApplication.countDocuments({ status: ApplicationStatus.APPROVED });
    const rejectedApplications = await LoanApplication.countDocuments({ status: ApplicationStatus.REJECTED });

    const approvedLoans = await LoanApplication.find({ status: ApplicationStatus.APPROVED });
    const totalApprovedAmount = approvedLoans.reduce((sum, app) => sum + app.loanAmount, 0);

    const recentApplications = await LoanApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('verifiedBy', 'username')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username');

    res.json({
      totalApplications,
      pendingApplications,
      verifiedApplications,
      approvedApplications,
      rejectedApplications,
      totalApprovedAmount,
      recentApplications,
      activeUsers: totalApplications,
      borrowers: approvedApplications,
      cashDisbursed: totalApprovedAmount,
      cashReceived: 0,
      savings: 0,
      repaidLoans: 0,
      otherAccounts: 0,
      loans: totalApplications
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for a specific user by email
router.get('/user/:email', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    // Modify this check to use the correct properties from req.user
    if (req.user && (req.user as any).email !== email && (req.user as any).role !== 'admin' && (req.user as any).role !== 'verifier') {
      res.status(403).json({ message: 'You are not authorized to view these applications' });
      return;
    }
    
    const applications = await LoanApplication.find({ email })
      .populate('verifiedBy', 'username')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get application by ID
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate('verifiedBy', 'username')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username');

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Verify application
router.patch('/:id/verify', authenticate, authorizeVerifier, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    if (application.status !== ApplicationStatus.PENDING) {
      res.status(400).json({ message: `Application is already ${application.status}` });
      return;
    }

    application.status = ApplicationStatus.VERIFIED;
    application.verifiedBy = new mongoose.Types.ObjectId((req.user as any).userId);
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Application verified successfully',
      application
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reject application
router.patch('/:id/reject', authenticate, authorizeVerifier, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    if (![ApplicationStatus.PENDING, ApplicationStatus.VERIFIED].includes(application.status)) {
      res.status(400).json({ message: `Cannot reject application that is already ${application.status}` });
      return;
    }

    application.status = ApplicationStatus.REJECTED;
    application.rejectedBy = new mongoose.Types.ObjectId((req.user as any).userId);
    application.rejectionReason = rejectionReason;
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Application rejected successfully',
      application
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Approve application
router.patch('/:id/approve', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    if (application.status !== ApplicationStatus.VERIFIED) {
      res.status(400).json({ message: 'Only verified applications can be approved' });
      return;
    }

    application.status = ApplicationStatus.APPROVED;
    application.approvedBy = new mongoose.Types.ObjectId((req.user as any).userId);
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Application approved successfully',
      application
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
