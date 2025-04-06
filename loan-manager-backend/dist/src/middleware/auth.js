"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = exports.authorizeVerifier = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
// Middleware to authenticate user based on JWT
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
// Middleware to authorize verifier or admin
const authorizeVerifier = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    if (req.user.role !== User_1.UserRole.VERIFIER && req.user.role !== User_1.UserRole.ADMIN) {
        res.status(403).json({ message: 'Not authorized' });
        return;
    }
    next();
};
exports.authorizeVerifier = authorizeVerifier;
// Middleware to authorize admin only
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    if (req.user.role !== User_1.UserRole.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
