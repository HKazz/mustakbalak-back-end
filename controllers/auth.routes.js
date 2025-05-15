const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/verify-token');

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
      address
    } = req.body;

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

    // Create new user
    const user = new User({
      username,
      fullName,
      email,
      phoneNumber,
      hashedPassword: password,
      nationality,
      DOB,
      address,
      userType: 'job_seeker'
    });

    await user.save();

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

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
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