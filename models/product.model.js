import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true,
    
  },
  name: {
    type: String,
    required: true,
  }, 
  ingredients: [String],
  calories: {
    type: Number,
    required: true,
  },
  dietarypreference: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
    required: true,
  },
  allergies: {
    type: [String], 
    enum : ["nuts" , "gluten" , "dairy" , "eggs" , "other"],
    default: [],
  },
} , {timestamps : true});

export const Product = mongoose.model("Product", productSchema);
