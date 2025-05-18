const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const verifyToken = require('../middleware/verify-token');
const verifyHiringManager = require('../middleware/verify-hiring-manager');

// Create a new job (only hiring managers)
router.post('/', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      responsibilities,
      salary,
      benefits,
      skills,
      experience,
      education,
      status
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title: 'Job title',
      company: 'Company name',
      location: 'Location',
      type: 'Job type',
      description: 'Job description',
      requirements: 'Requirements',
      responsibilities: 'Responsibilities',
      salary: 'Salary information',
      skills: 'Required skills',
      experience: 'Experience level',
      education: 'Education requirement'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !req.body[field])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate salary
    if (!salary.min || !salary.max || !salary.currency) {
      return res.status(400).json({
        message: 'Invalid salary information',
        details: 'Please provide minimum salary, maximum salary, and currency'
      });
    }

    // Validate arrays
    if (!Array.isArray(requirements) || requirements.length === 0) {
      return res.status(400).json({
        message: 'At least one requirement is needed'
      });
    }

    if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
      return res.status(400).json({
        message: 'At least one responsibility is needed'
      });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        message: 'At least one skill is required'
      });
    }

    const job = new Job({
      title,
      company,
      location,
      type,
      description,
      requirements,
      responsibilities,
      salary,
      benefits: benefits || [],
      skills,
      experience,
      education,
      status: status || 'Active',
      hiringManager: req.hiringManager._id
    });

    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Error creating job',
      error: error.message
    });
  }
});

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('hiringManager', 'companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs posted by the current hiring manager
router.get('/hiring-manager/me', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    const jobs = await Job.find({ 
      hiringManager: req.hiringManager._id 
    })
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching hiring manager jobs:', error);
    res.status(500).json({
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get jobs posted by a specific hiring manager
router.get('/hiring-manager/:hiringManagerId', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      hiringManager: req.params.hiringManagerId,
      status: 'Active'
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching hiring manager jobs',
      error: error.message
    });
  }
});

// Get a specific job (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('hiringManager', 'fullName company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// Update a job (only the hiring manager who created it)
router.put('/:id', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the hiring manager owns this job
    if (job.hiringManager.toString() !== req.hiringManager._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own jobs.' 
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('hiringManager', 'fullName company');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating job',
      error: error.message
    });
  }
});

// Delete a job (only the hiring manager who created it)
router.delete('/:id', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the hiring manager owns this job
    if (job.hiringManager.toString() !== req.hiringManager._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own jobs.' 
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      message: 'Error deleting job',
      error: error.message
    });
  }
});

module.exports = router; 