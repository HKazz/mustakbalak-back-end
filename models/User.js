const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
          return /^\d{8,15}$/.test(v); // Ensures phone number is between 8-15 digits
        },
        message: "Invalid phone number format",
      },
    },
    nationality: {
      type: String,
      lowercase: true,
    },
    DOB: {
      type: Date,
    },
    education: {
      type: String,
      trim: true,
    },
    certificate: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    fields: {
      type: String,
      default: "",
    },
    Address: {
      type: String,
      required: [true, "Address is required"],
    },
    userType: {
      type: String,
      required: [true, "User type is required"],
      enum: ["job seeker", "hiring manager"],
    },
    currentPosition: {
      type: String,
      required: function () {
        return this.userType === "hiring manager";
      },
      default: "",
    },
    company: {
      type: String,
      required: function () {
        return this.userType === "hiring manager";
      },
      default: "",
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;