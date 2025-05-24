const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const verifyToken = require('../middleware/verify-token');
const verifyHiringManager = require('../middleware/verify-hiring-manager');

// Get all applications for a specific user (job seeker)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all applications for this user
    const applications = await Application.find({ applicant: userId })
      .populate({
        path: 'job',
        select: 'title company location type salary experience education description requirements responsibilities skills benefits'
      })
      .populate({
        path: 'applicant',
        select: 'fullName email phoneNumber education experience skills'
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get all applications for a hiring manager
router.get('/hiring-manager', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    // First, get all jobs posted by the hiring manager
    const jobs = await Job.find({ hiringManager: req.hiringManager._id });
    const jobIds = jobs.map(job => job._id);

    // Then, get all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location type salary experience education')
      .populate('applicant', 'fullName email phoneNumber education experience')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get a specific application by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title company location type salary experience education description requirements responsibilities skills benefits'
      })
      .populate({
        path: 'applicant',
        select: 'fullName email phoneNumber education experience skills'
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if the user is either the applicant or the hiring manager of the job
    const job = await Job.findById(application.job._id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isApplicant = application.applicant._id.toString() === req.user.userId;
    const isHiringManager = job.hiringManager.toString() === req.hiringManager?._id.toString();

    if (!isApplicant && !isHiringManager) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Error fetching application' });
  }
});

// Update application status (hiring manager only)
router.put('/:id', verifyToken, verifyHiringManager, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify that the application is for a job posted by this hiring manager
    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.hiringManager.toString() !== req.hiringManager._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Populate the job and applicant details before sending response
    await application.populate({
      path: 'job',
      select: 'title company location type salary experience education description requirements responsibilities skills benefits'
    });
    await application.populate({
      path: 'applicant',
      select: 'fullName email phoneNumber education experience skills'
    });

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// Create a new application (job seeker only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { job } = req.body;
    const userId = req.user.userId;

    if (!job) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const jobExists = await Job.findById(job);
    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: job,
      applicant: userId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create new application
    const application = new Application({
      job: job,
      applicant: userId,
      status: 'Pending'
    });

    await application.save();

    // Populate the job and applicant details before sending response
    await application.populate('job', 'title company location type salary experience education');
    await application.populate('applicant', 'fullName email');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Error creating application',
      error: error.message 
    });
  }
});

module.exports = router; 