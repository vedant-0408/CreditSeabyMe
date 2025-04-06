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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Register new user (public route for user registration)
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                message: existingUser.email === email
                    ? 'Email already in use'
                    : 'Username already taken'
            });
            return;
        }
        // Default role is 'user' unless specified and requester is admin
        let userRole = User_1.UserRole.USER;
        // If role is specified and not 'user', verify admin authorization
        if (role && role !== User_1.UserRole.USER) {
            // For admin/verifier creation, check if requester is admin
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
                    if (decoded.role === User_1.UserRole.ADMIN) {
                        userRole = role;
                    }
                }
                catch (err) {
                    // If token verification fails, default to user role
                    userRole = User_1.UserRole.USER;
                }
            }
        }
        const newUser = new User_1.default({
            username,
            email,
            password, // No hashing as per requirements
            role: userRole
        });
        yield newUser.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Admin-only user creation
router.post('/create-user', auth_1.authenticate, auth_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        const existingUser = yield User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                message: existingUser.email === email
                    ? 'Email already in use'
                    : 'Username already taken'
            });
            return;
        }
        const newUser = new User_1.default({
            username,
            email,
            password,
            role: role || User_1.UserRole.VERIFIER
        });
        yield newUser.save();
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        if (user.password !== password) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Role-specific login routes
router.post('/login/admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email, role: User_1.UserRole.ADMIN });
        if (!user) {
            res.status(401).json({ message: 'Invalid admin credentials' });
            return;
        }
        if (user.password !== password) {
            res.status(401).json({ message: 'Invalid admin credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.post('/login/verifier', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email, role: User_1.UserRole.VERIFIER });
        if (!user) {
            res.status(401).json({ message: 'Invalid verifier credentials' });
            return;
        }
        if (user.password !== password) {
            res.status(401).json({ message: 'Invalid verifier credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get current user
router.get('/me', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = yield User_1.default.findById(req.user.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Admin routes for managing users
router.get('/users', auth_1.authenticate, auth_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.delete('/users/:id', auth_1.authenticate, auth_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Prevent deleting self
        if (user._id.toString() === req.user.userId) {
            res.status(400).json({ message: 'Cannot delete your own account' });
            return;
        }
        yield User_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
