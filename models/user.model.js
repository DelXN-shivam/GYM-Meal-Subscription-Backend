import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: { 
    type: String,
    required: true, 
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  height: {
    type: Number, // in cm 
    required: true,
  },
  weight: {
    type: Number, // in kg 
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/, // Adjust regex as needed
  },
  homeAddress: {
    type: String,
    required: false,
  },
  officeAddress: {
    type: String,
    required: false,
  },
  collegeAddress: {
    type: String,
    required: false,
  },
  fitnessGoal: {
    type: String,
    required: true,
    default : "muscle-gain"
  },
  dietPreference: {
    type: String,
    required: true,
    default : "veg"
  },
  allergy: {
    type: String,
    required: false,
    default : "none"
  },
  activityLevel : {
    type : String , 
    required : true,
    default : "active"
  }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);