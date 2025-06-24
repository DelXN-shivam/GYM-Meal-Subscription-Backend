import express from 'express';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';

/*
  handles requests for /api/v1/product

  1. product/add ---->  add a product , eg: eggs , boiled chicken , panner etc

  2. product/suggest ----> suggest products based on the following 
                            i) type : breakfast , lunch , dinner
                           ii) dietaryPreference : veg , non-veg , vegan
                          iii) allergies : dairy , eggs , vegan ,
*/
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

// Utility to find the best combination of products for a given calorie target
function generateMealCombos(products, targetCalories) {
  let bestCombo = [];
  let bestDiff = Infinity;

  const n = products.length;

  // Limit brute-force combinations to small sets
  for (let i = 0; i < 1 << n; i++) {
    const combo = [];
    let total = 0;

    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        combo.push(products[j]);
        total += products[j].calories;
      }
    }

    const diff = Math.abs(targetCalories - total);
    if (diff < bestDiff && combo.length > 0) {
      bestDiff = diff;
      bestCombo = combo;
    }

    // Stop early if exact match
    if (bestDiff === 0) break;
  }

  return bestCombo;
}

// Route handler
productRouter.get("/suggest", async (req, res) => {
  try {
    const { dietaryPreference, allergies, calories , userId } = req.query;

    if (!dietaryPreference || !calories) {
      return res.status(400).json({
        message: "Both dietaryPreference and calories are required."
      });
    }

    const totalCalories = parseInt(calories);
    if (isNaN(totalCalories) || totalCalories <= 0) {
      return res.status(400).json({ message: "Calories must be a positive number." });
    }

    const calorieDistribution = {
      breakfast: totalCalories * 0.3,
      lunch: totalCalories * 0.4,
      dinner: totalCalories * 0.3
    };

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

    const requestedTypes = ["breakfast", "lunch", "dinner"];

    const suggestions = {};

    for (const type of requestedTypes) {
      const targetCalories = calorieDistribution[type];

      const query = {
        type,
        dietaryPreference: { $in: dietPrefs }
      };

      if (allergyList.length > 0) {
        query.allergies = { $nin: allergyList };
      }

      const products = await Product.find(query)
        .select("name type calories dietaryPreference allergies")
        .lean();

      if (!products || products.length === 0) {
        suggestions[type] = [];
        continue;
      }

      // Pick best combination of products to match target calories
      const bestCombo = generateMealCombos(products, targetCalories);
      suggestions[type] = bestCombo;
    }

    await addProductsToUser(userId, suggestions);

    res.status(200).json({
      totalCalories,
      calories : {
        calorieDistribution
      },
      suggestions,
      filtersApplied: {
        dietaryPreference: dietPrefs,
        excludedAllergies: allergyList
      }
    });

  } catch (error) {
    console.error("Error suggesting meals:", error);
    res.status(500).json({ message: "Server error." });
  }
});

async function addProductsToUser(userId, combo) {
  try {
    const productSet = {
      breakfast: combo.breakfast.map(item => item._id),
      lunch: combo.lunch.map(item => item._id),
      dinner: combo.dinner.map(item => item._id)
    };

    // Update user with the product references
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          products: {
            breakfast: productSet.breakfast,
            lunch: productSet.lunch,
            dinner: productSet.dinner
          }
        }
      },
      { new: true } // Return the updated user
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating user with suggested products:", error);
    throw error;
  }
}

productRouter.get("/all" , async  ( req , res ) => {
  try {
    const products = await Product.find()
    if(!products){
    return res.status(411).json({
      message : "no products found"
    })
  }
    return res.status(200).json({
      message : "Products found",
      products : products
    })
}
  catch(err){
    console.error("Cannot get products" , err)
    return res.status(500).json({
      message  : 'Internal server error'
    })
  }
})

productRouter.delete("/delete/:id" , async (req , res) => {
  try {
    const id = req.params.id;

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }


    const deleteProduct = await Product.deleteOne({_id : id})
    if(!deleteProduct){
      return res.status(411).json({
        message : "Product Deletion not successfull"
      })
    }
    
    return res.status(200).json({
      message : "Product deleted successfully"
    })

  }
  catch(err){ 
    console.error(err)
    return res.status(500).json({
      message : "Server Error",
      error : err.message
    })
  }
})

productRouter.get("/get/:id" , async ( req , res ) => {
  try {
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);

    if(!existingProduct){
      return res.status(401).json({
        message : "Product does not exist"
      })
    }

    return res.status(200).json({
      message : "Product found",
      product : existingProduct
    })

  } catch(err){
    console.error(err)
    return res.status(500).json({
      message : "Error fetching product",
      error : err.message
    })
  }
})