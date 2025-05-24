const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
      enum: [
        "United Arab Emirates",
        "Saudi Arabia",
        "Qatar",
        "Kuwait",
        "Oman",
        "Bahrain"
      ]
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      required: [true, "Job type is required"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [{
      type: String,
      required: [true, "At least one requirement is needed"],
    }],
    responsibilities: [{
      type: String,
      required: [true, "At least one responsibility is needed"],
    }],
    salary: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"],
      },
      max: {
        type: Number,
        required: [true, "Maximum salary is required"],
      },
      currency: {
        type: String,
        enum: ["AED", "SAR", "QAR", "KWD", "BHD", "OMR", "USD", "EUR", "GBP"],
        default: "AED",
      },
    },
    benefits: [{
      type: String,
    }],
    skills: [{
      type: String,
      required: [true, "At least one skill is required"],
    }],
    experience: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ["Entry Level", "Mid Level", "Senior Level", "Executive"],
    },
    education: {
      type: String,
      required: [true, "Education requirement is required"],
      enum: ["High School", "Bachelor's", "Master's", "PhD", "Any"],
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "Draft"],
      default: "Active",
    },
    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringManager",
      required: [true, "Hiring manager reference is required"],
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text'
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job; 