import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Register new user (public route for user registration)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
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
    let userRole = UserRole.USER;
    
    // If role is specified and not 'user', verify admin authorization
    if (role && role !== UserRole.USER) {
      // For admin/verifier creation, check if requester is admin
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
          if (decoded.role === UserRole.ADMIN) {
            userRole = role;
          }
        } catch (err) {
          // If token verification fails, default to user role
          userRole = UserRole.USER;
        }
      }
    }

    const newUser = new User({
      username,
      email,
      password, // No hashing as per requirements
      role: userRole
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Admin-only user creation
router.post('/create-user', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ 
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

    const newUser = new User({
      username,
      email,
      password,
      role: role || UserRole.VERIFIER
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Role-specific login routes
router.post('/login/admin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: UserRole.ADMIN });
    if (!user) {
      res.status(401).json({ message: 'Invalid admin credentials' });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: 'Invalid admin credentials' });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login/verifier', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: UserRole.VERIFIER });
    if (!user) {
      res.status(401).json({ message: 'Invalid verifier credentials' });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: 'Invalid verifier credentials' });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById((req.user as any).userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes for managing users
router.get('/users', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent deleting self
    if (user._id.toString() === (req.user as any).userId) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
