const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');

// Rate limiting for auth routes to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to login and signup routes
router.use(['/login', '/signup'], authLimiter);

// Input validation for signup
const validateSignup = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  check('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

// Input validation for login
const validateLogin = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Signup route
router.post('/signup', express.json(), validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, username } = req.body;
    
    // Ensure we have all required fields
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      loginAttempts: 0
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email }, 
      process.env.JWT_SECRET || 'fallback_secret_key_for_development', 
      { 
        expiresIn: '24h',
        issuer: 'cinesearch-app'
      }
    );

    // Set HTTP-only cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ 
      token,
      user: { email, username },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
router.post('/login', express.json(), validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    
    // Ensure we have all required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked due to too many attempts
    if (user.loginAttempts >= 5 && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(429).json({ 
        message: 'Account is temporarily locked. Please try again later.' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      await usersCollection.updateOne(
        { email },
        { 
          $inc: { loginAttempts: 1 },
          $set: user.loginAttempts >= 4 ? { lockUntil: Date.now() + 15 * 60 * 1000 } : {}
        }
      );
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email }, 
      process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      { 
        expiresIn: '24h',
        issuer: 'cinesearch-app'
      }
    );

    // Reset login attempts on successful login
    await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          loginAttempts: 0, 
          lockUntil: null,
          lastLogin: new Date()
        }
      }
    );

    // Set HTTP-only cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ 
      token,
      user: { email, username: user.username },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile (protected route)
router.get('/me', async (req, res) => {
  try {
    // Check for token in authorization header or cookies
    const tokenHeader = req.headers.authorization?.split(' ')[1];
    const tokenCookie = req.cookies?.auth_token;
    const token = tokenHeader || tokenCookie;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Add a fallback secret key for development
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    
    const decoded = jwt.verify(token, jwtSecret);
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { email: decoded.email }, 
      { projection: { password: 0, loginAttempts: 0, lockUntil: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Password reset request
router.post('/forgot-password', 
  express.json(),
  [check('email').isEmail().withMessage('Please provide a valid email')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const db = getDB();
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not (security best practice)
        return res.status(200).json({ 
          message: 'If your email is registered, you will receive a password reset link' 
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id.toString(), email, purpose: 'password_reset' }, 
        process.env.JWT_SECRET || 'fallback_secret_key_for_development', 
        { expiresIn: '1h' }
      );

      // Store reset token and expiry in database
      await usersCollection.updateOne(
        { email },
        { 
          $set: { 
            passwordResetToken: resetToken,
            passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
          }
        }
      );

      // In a real application, send an email with the reset link
      // For this example, we'll just return the token
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link',
        // Only for development, remove in production:
        resetToken
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;