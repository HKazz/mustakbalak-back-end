const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const HiringManager = require('../models/HiringManager');
const verifyToken = require('../middleware/verify-token');

// Signup route for hiring managers
router.post('/signup', async (req, res) => {
  try {
    const { 
      username,
      fullName,
      email,
      phoneNumber,
      password,
      currentPosition,
      company,
      department,
      role,
      companySize,
      industry,
      address
    } = req.body;

    // Check if hiring manager already exists
    const existingManager = await HiringManager.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingManager) {
      return res.status(400).json({ 
        message: existingManager.email === email ? 
          'Email already registered' : 
          'Username already taken' 
      });
    }

    // Create new hiring manager
    const hiringManager = new HiringManager({
      username,
      fullName,
      email,
      phoneNumber,
      hashedPassword: password,
      currentPosition,
      company,
      department,
      role,
      companySize,
      industry,
      address,
      userType: 'hiring_manager'
    });

    await hiringManager.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: hiringManager._id,
        userType: 'hiring_manager'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending response
    const managerResponse = hiringManager.toObject();
    delete managerResponse.hashedPassword;

    res.status(201).json({
      message: 'Hiring manager created successfully',
      token,
      user: managerResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hiring manager', error: error.message });
  }
});

// Login route for hiring managers
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find hiring manager
    const hiringManager = await HiringManager.findOne({ username });
    if (!hiringManager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await hiringManager.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user type
    if (!hiringManager.userType) {
      // Update existing account to have the correct user type
      hiringManager.userType = 'hiring_manager';
      await hiringManager.save();
    } else if (hiringManager.userType !== 'hiring_manager') {
      return res.status(403).json({ 
        message: 'Access denied. This login is for hiring managers only. Please use the job seeker login page.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: hiringManager._id,
        userType: 'hiring_manager'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending response
    const managerResponse = hiringManager.toObject();
    delete managerResponse.hashedPassword;

    res.json({
      message: 'Login successful',
      token,
      user: managerResponse
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

    // Update hiring manager profile
    const hiringManager = await HiringManager.findById(userId);
    if (!hiringManager) {
      return res.status(404).json({ message: 'Hiring manager not found' });
    }

    // Update fields
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
        hiringManager[field] = updateData[field];
      }
    });

    hiringManager.profileCompleted = true;
    await hiringManager.save();

    // Remove sensitive data before sending response
    const managerResponse = hiringManager.toObject();
    delete managerResponse.hashedPassword;

    res.json({
      message: 'Profile completed successfully',
      user: managerResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing profile', error: error.message });
  }
});

// Get hiring manager profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const hiringManager = await HiringManager.findById(userId);

    if (!hiringManager) {
      return res.status(404).json({ message: 'Hiring manager not found' });
    }

    // Remove sensitive data before sending response
    const managerResponse = hiringManager.toObject();
    delete managerResponse.hashedPassword;

    res.json({
      user: managerResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Delete hiring manager profile
router.delete('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Attempting to delete hiring manager profile:', userId);

    const hiringManager = await HiringManager.findById(userId);
    if (!hiringManager) {
      console.log('Hiring manager not found:', userId);
      return res.status(404).json({ message: 'Hiring manager not found' });
    }

    console.log('Found hiring manager, proceeding with deletion');
    await HiringManager.findByIdAndDelete(userId);
    console.log('Hiring manager deleted successfully');

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