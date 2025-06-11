import mongoose from 'mongoose';

//product schema 
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: [String],
    enum: ["breakfast", "lunch", "dinner"],
    required: false
  },
  subCategory: {
    type: String,
    required: false,
    trim: true
  },
  quantity: {
    type: mongoose.Schema.Types.Mixed, 
    required: false
  },
  calories: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: false
  },
  dietaryPreference: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
    required: true,
  },
  allergies: {
    type: [String], 
    enum: ["nuts", "gluten", "dairy", "eggs", "other"],
    default: [],
  },
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);