"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const LoanApplication_1 = __importStar(require("../models/LoanApplication"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create new loan application (public route)
// Create new loan application (public route)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicantName, email, loanAmount, purpose, loanTenure, employmentStatus, employmentAddress } = req.body;
        const newApplication = new LoanApplication_1.default({
            applicantName,
            email,
            loanAmount,
            purpose,
            loanTenure,
            employmentStatus,
            employmentAddress,
            status: LoanApplication_1.ApplicationStatus.PENDING
        });
        yield newApplication.save();
        res.status(201).json({
            message: 'Application submitted successfully',
            application: newApplication
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Get all applications with pagination, sorting and filtering
router.get('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, page = 1, limit = 7, sort = 'createdAt', order = 'desc' } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = order === 'asc' ? 1 : -1;
        const sortOptions = {};
        sortOptions[sort] = sortDirection;
        const applications = yield LoanApplication_1.default.find(query)
            .populate('verifiedBy', 'username')
            .populate('approvedBy', 'username')
            .populate('rejectedBy', 'username')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        const totalApplications = yield LoanApplication_1.default.countDocuments(query);
        res.json({
            applications,
            pagination: {
                total: totalApplications,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(totalApplications / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Dashboard statistics
router.get('/stats/dashboard', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalApplications = yield LoanApplication_1.default.countDocuments();
        const pendingApplications = yield LoanApplication_1.default.countDocuments({ status: LoanApplication_1.ApplicationStatus.PENDING });
        const verifiedApplications = yield LoanApplication_1.default.countDocuments({ status: LoanApplication_1.ApplicationStatus.VERIFIED });
        const approvedApplications = yield LoanApplication_1.default.countDocuments({ status: LoanApplication_1.ApplicationStatus.APPROVED });
        const rejectedApplications = yield LoanApplication_1.default.countDocuments({ status: LoanApplication_1.ApplicationStatus.REJECTED });
        const approvedLoans = yield LoanApplication_1.default.find({ status: LoanApplication_1.ApplicationStatus.APPROVED });
        const totalApprovedAmount = approvedLoans.reduce((sum, app) => sum + app.loanAmount, 0);
        const recentApplications = yield LoanApplication_1.default.find()
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get applications for a specific user by email
router.get('/user/:email', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        // Modify this check to use the correct properties from req.user
        if (req.user && req.user.email !== email && req.user.role !== 'admin' && req.user.role !== 'verifier') {
            res.status(403).json({ message: 'You are not authorized to view these applications' });
            return;
        }
        const applications = yield LoanApplication_1.default.find({ email })
            .populate('verifiedBy', 'username')
            .populate('approvedBy', 'username')
            .populate('rejectedBy', 'username')
            .sort({ createdAt: -1 });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get application by ID
router.get('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const application = yield LoanApplication_1.default.findById(req.params.id)
            .populate('verifiedBy', 'username')
            .populate('approvedBy', 'username')
            .populate('rejectedBy', 'username');
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        res.json(application);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Verify application
router.patch('/:id/verify', auth_1.authenticate, auth_1.authorizeVerifier, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const application = yield LoanApplication_1.default.findById(req.params.id);
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        if (application.status !== LoanApplication_1.ApplicationStatus.PENDING) {
            res.status(400).json({ message: `Application is already ${application.status}` });
            return;
        }
        application.status = LoanApplication_1.ApplicationStatus.VERIFIED;
        application.verifiedBy = new mongoose_1.default.Types.ObjectId(req.user.userId);
        application.updatedAt = new Date();
        yield application.save();
        res.json({
            message: 'Application verified successfully',
            application
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Reject application
router.patch('/:id/reject', auth_1.authenticate, auth_1.authorizeVerifier, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const application = yield LoanApplication_1.default.findById(req.params.id);
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        if (![LoanApplication_1.ApplicationStatus.PENDING, LoanApplication_1.ApplicationStatus.VERIFIED].includes(application.status)) {
            res.status(400).json({ message: `Cannot reject application that is already ${application.status}` });
            return;
        }
        application.status = LoanApplication_1.ApplicationStatus.REJECTED;
        application.rejectedBy = new mongoose_1.default.Types.ObjectId(req.user.userId);
        application.rejectionReason = rejectionReason;
        application.updatedAt = new Date();
        yield application.save();
        res.json({
            message: 'Application rejected successfully',
            application
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Approve application
router.patch('/:id/approve', auth_1.authenticate, auth_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const application = yield LoanApplication_1.default.findById(req.params.id);
        if (!application) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        if (application.status !== LoanApplication_1.ApplicationStatus.VERIFIED) {
            res.status(400).json({ message: 'Only verified applications can be approved' });
            return;
        }
        application.status = LoanApplication_1.ApplicationStatus.APPROVED;
        application.approvedBy = new mongoose_1.default.Types.ObjectId(req.user.userId);
        application.updatedAt = new Date();
        yield application.save();
        res.json({
            message: 'Application approved successfully',
            application
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
