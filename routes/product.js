import express from 'express';
import { Product } from '../models/product.model.js';

export const productRouter = express.Router();

productRouter.post("/add", async (req, res) => {
  try {
    const {
      name,
      type,
      subCategory,
      quantity,
      calories,
      price,
      dietaryPreference,
      allergies
    } = req.body;

    if (!name  || !calories || !dietaryPreference) {
      return res.status(400).json({ message: "Missing required fields: name, quantity, calories, price, dietaryPreference." });
    }

    const existingProduct = await Product.findOne({ 
      name, 
      subCategory: subCategory || null, 
      dietaryPreference 
    });
    
    if (existingProduct) {
      return res.status(409).json({ message: "Product with this name and subcategory already exists." });
    }

    const newProduct = new Product({
      name,
      type: type || undefined,
      subCategory: subCategory || undefined,
      quantity,
      calories,
      price,
      dietaryPreference,
      allergies: allergies || []
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

productRouter.get("/suggest", async (req, res) => {
  try {
    const { dietaryPreference, allergies } = req.query;

    if (!dietaryPreference) {
      return res.status(400).json({ message: "Dietary preference is required." });
    }

   
    const dietPrefs = dietaryPreference
      .split(",")
      .map(d => d.trim().toLowerCase());

    
    const validPrefs = ["veg", "non-veg", "vegan"];
    const invalidPrefs = dietPrefs.filter(d => !validPrefs.includes(d));
    
    if (invalidPrefs.length > 0) {
      return res.status(400).json({ 
        message: `Invalid dietary preference(s): ${invalidPrefs.join(", ")}` 
      });
    }

    
    const allergyList = allergies
      ? allergies.split(",").map(a => a.trim().toLowerCase())
      : [];

    
    const requestedTypes = req.query.type
      ? req.query.type.split(",").map(t => t.trim().toLowerCase())
      : ["breakfast", "lunch", "dinner"];

   
    const query = {
      type: { $in: requestedTypes },
      dietaryPreference: { $in: dietPrefs },
    };

    
    if (allergyList.length > 0) {
      query.allergies = { $nin: allergyList };
    }

    
    const suggestedProducts = await Product.find(query)
      .select('name type calories dietaryPreference allergies')
      .lean();

    if (suggestedProducts.length === 0) {
      return res.status(404).json({ 
        message: "No products found matching your criteria." 
      });
    }

    res.status(200).json({
      count: suggestedProducts.length,
      products: suggestedProducts,
      filtersApplied: {
        dietaryPreference: dietPrefs,
        excludedAllergies: allergyList,
        mealTypes: requestedTypes
      }
    });

  } catch (error) {
    console.error("Error suggesting meals:", error);
    res.status(500).json({ message: "Server error." });
  }
});
