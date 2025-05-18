const HiringManager = require('../models/HiringManager');

const verifyHiringManager = async (req, res, next) => {
  try {
    // Check if user is authenticated and is a hiring manager
    if (!req.user || req.user.userType !== 'hiring_manager') {
      return res.status(403).json({ 
        message: 'Access denied. Only hiring managers can perform this action.' 
      });
    }

    // Verify hiring manager exists
    const hiringManager = await HiringManager.findById(req.user.userId);
    if (!hiringManager) {
      return res.status(404).json({ 
        message: 'Hiring manager not found' 
      });
    }

    // Add hiring manager to request for later use
    req.hiringManager = hiringManager;
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Error verifying hiring manager', 
      error: error.message 
    });
  }
};

module.exports = verifyHiringManager; 