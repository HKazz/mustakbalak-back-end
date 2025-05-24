const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    userType: {
      type: String,
      required: [true, "User type is required"],
      enum: ["job seeker", "hiring manager"],
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
          return /^\d{8,15}$/.test(v); // Ensures phone number is between 8-15 digits
        },
        message: "Invalid phone number format",
      },
    },
    userType: {
      type: String,
      enum: ['job_seeker', 'hiring_manager'],
      required: [true, "User type is required"],
    },
    nationality: {
      type: String,
      lowercase: true,
    },
    DOB: {
      type: Date,
    },

    education: [{
      institution: String,
      degree: String,
      field: String,
      graduationYear: Number,
      gpa: Number,
      description: String
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
      location: String,
      isCurrentPosition: Boolean
    }],
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      }
    }],
    certificates: [{
      name: String,
      issuer: String,
      date: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String
    }],
    fields: [{
      type: String
    }],
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    // education: {
    //   type: String,
    //   trim: true,
    // },
    certificate: {
      type: String,
      default: "",
    },
    // experience: {
    //   type: String,
    //   default: "",
    // // },
    // fields: {
    //   type: String,
    //   default: "",
    // },
    Address: {
      type: String,
      required: [true, "Address is required"],
    },
    currentPosition: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",

    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required"],
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
    },
    code:{
      type: String

    },
    isVerified: { type: Boolean, default: false }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);


// Hash password before saving
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      delete returnedObject.hashedPassword;
  }
});




const User = mongoose.model("User", userSchema);

module.exports = User;