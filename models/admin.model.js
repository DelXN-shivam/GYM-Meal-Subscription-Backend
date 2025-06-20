// app/models/Admin.js
"use server";

import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Prevent OverwriteModelError in Next.js hot reloads
 const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin