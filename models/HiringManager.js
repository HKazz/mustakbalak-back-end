const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const hiringManagerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{8,15}$/.test(v);
        },
        message: "Invalid phone number format",
      },
    },
    currentPosition: {
      type: String,
      required: [true, "Current position is required"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    role: {
      type: String,
      enum: ["recruiter", "hiring manager", "talent acquisition", "hr manager"],
      required: [true, "Role is required"],
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      required: [true, "Company size is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required"],
    },
    userType: {
      type: String,
      enum: ['job_seeker', 'hiring_manager'],
      default: 'hiring_manager',
      required: true
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
hiringManagerSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
hiringManagerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

const HiringManager = mongoose.model("HiringManager", hiringManagerSchema);

module.exports = HiringManager; 