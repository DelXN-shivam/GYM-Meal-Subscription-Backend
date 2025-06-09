import express from 'express';
import { Product } from '../models/product.model.js';

export const productRouter = express.Router();

productRouter.post("/add", async (req, res) => {
  try {
    const {
      type,
      name,
      ingredients,
      calories,
      dietarypreference,
      allergies
    } = req.body;

    if (!type || !name || !ingredients || !calories || !dietarypreference) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingMeal = await Product.findOne({ type, name, dietarypreference });
    if (existingMeal) {
      return res.status(409).json({ message: "Meal already exists." });
    }

    const newProduct = new Product({
      type,
      name,
      ingredients,
      calories,
      dietarypreference,
      allergies: allergies || [] 
    });

    const savedMeal = await newProduct.save();

    res.status(201).json({
      message: "Meal added successfully.",
      meal: savedMeal
    });
  } catch (error) {
    console.error("Error adding meal:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

productRouter.get("/suggest", async (req, res) => {
  try {
    const { dietaryPreference, calories, allergies } = req.query;

    if (!dietaryPreference || !calories) {
      return res.status(400).json({ message: "Missing required parameters." });
    }

    const dailyCalories = parseInt(calories);
    const allergyList = allergies
      ? allergies.split(",").map((a) => a.trim().toLowerCase())
      : [];

    const mealTargets = {
      breakfast: Math.round(dailyCalories * 0.3),
      lunch: Math.round(dailyCalories * 0.4),
      dinner: Math.round(dailyCalories * 0.3),
    };

    const getMeal = async (type, targetCalories) => {
      const minCalories = Math.round(targetCalories * 0.85);
      const maxCalories = Math.round(targetCalories * 1.15);

      const query = {
        type,
        dietarypreference: dietaryPreference.toLowerCase(), 
        calories: { $gte: minCalories, $lte: maxCalories },
        allergies: { $nin: allergyList },
      };

      const meals = await Product.find(query);

      if (meals.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * meals.length);
      const selectedMeal = meals[randomIndex];

      return {
        type: selectedMeal.type,
        name: selectedMeal.name,
        calories: selectedMeal.calories,
        ingredients: selectedMeal.ingredients,
      };
    };

    const breakfast = await getMeal("breakfast", mealTargets.breakfast);
    const lunch = await getMeal("lunch", mealTargets.lunch);
    const dinner = await getMeal("dinner", mealTargets.dinner);

    res.status(200).json({
      totalCalories: dailyCalories,
      suggestedMeals: {
        breakfast,
        lunch,
        dinner,
      },
    });
  } catch (error) {
    console.error("Error suggesting meals:", error);
    res.status(500).json({ message: "Server error." });
  }
});
