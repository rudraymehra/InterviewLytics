import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

interface SignupRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    role: 'candidate' | 'recruiter';
    company?: string;
    phone?: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const signup = async (req: SignupRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, company, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Validate required fields based on role
    if (role === 'recruiter' && !company) {
      res.status(400).json({
        success: false,
        message: 'Company name is required for recruiters'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData: any = {
      name,
      email,
      passwordHash,
      role,
      phone
    };

    if (role === 'recruiter') {
      userData.company = company;
    }

    const user = await User.create(userData);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET as Secret;
    const signOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      signOptions
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error: any) {
    // Handle duplicate key error from unique index
    if (error?.code === 11000 && error?.keyPattern?.email) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET as Secret;
    const signOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      signOptions
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
