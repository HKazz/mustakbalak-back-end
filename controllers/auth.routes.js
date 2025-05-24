const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/verify-token');
const sendEmail = require('../sendEmail'); // Ensure this is imported

// Signup route for job seekers
router.post('/signup', async (req, res) => {
  try {
    const { 
      username,
      fullName,
      email,
      phoneNumber,
      password,
      nationality,
      DOB,
      Address
    } = req.body;

    let address = Address;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 
          'Email already registered' : 
          'Username already taken' 
      });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user with verification fields
    const user = new User({
      username,
      fullName,
      email,
      phoneNumber,
      hashedPassword: password,
      nationality,
      DOB,
      Address: address,
      userType: 'job_seeker',
      isVerified: false,
      code: verificationCode
    });

    await user.save();

    // Send verification code to user's email
    sendEmail(user.email, verificationCode);

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.hashedPassword;
    delete userResponse.code;

    res.status(201).json({
      message: 'User created successfully. Please check your email for the verification code.',
      user: userResponse
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login route for job seekers
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Find user
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    console.log('Password valid:', isValidPassword ? 'Yes' : 'No');

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user type
    if (user.userType !== 'job_seeker') {
      return res.status(403).json({ 
        message: 'Access denied. This login is for job seekers only. Please use the hiring manager login page.' 
      });

    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        userType: 'job_seeker'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.hashedPassword;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Complete profile route
router.post('/complete-profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User type:', user.userType);

    // Check user type and update fields accordingly
    if (user.userType === 'job_seeker') {
      const fields = [
        'fullName',
        'phoneNumber',
        'nationality',
        'DOB',
        'education',
        'experience',
        'skills',
        'certificates',
        'address',
        'fields'
      ];
      
      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });
    } else if (user.userType === 'hiring_manager') {
      const fields = [
        'fullName',
        'phoneNumber',
        'currentPosition',
        'company',
        'department',
        'role',
        'companySize',
        'industry',
        'address'
      ];
      
      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });
    }

    user.profileCompleted = true;
    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.hashedPassword;

    res.json({
      message: 'Profile completed successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing profile', error: error.message });
  }
});

// Email authentication route
router.post("/authenticate/:email", async (req, res) => {
  const { code } = req.body;
  const { email } = req.params;

  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(foundUser.code);
    console.log(code);
    if (foundUser.code === code) {
      await User.findByIdAndUpdate(foundUser._id, { code: null });
      res.json({ message: "You are verified. Please log in" });
    } else {
      res.json({ message: "incorrect code" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error during authentication", error: err.message });
  }
});

// Verify email route
router.post("/verify-email", async (req, res) => {
  const { username, token } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.code === token) { // <-- use .code here
      user.isVerified = true;
      user.code = undefined;   // <-- clear .code
      await user.save();
      return res.json({ success: true, message: "Email verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error during verification", error: err.message });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.hashedPassword;

    res.json({
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Delete user profile
router.delete('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Attempting to delete user profile:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user, proceeding with deletion');
    await User.findByIdAndDelete(userId);
    console.log('User deleted successfully');

    res.json({ 
      message: 'Profile deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ 
      message: 'Error deleting profile', 
      error: error.message 
    });
  }
});

module.exports = router;