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
    // === Single product add logic (commented out) ===
    // const {
    //   name,
    //   type,
    //   measurement,
    //   quantity,
    //   calories,
    //   price,
    //   dietaryPreference,
    //   allergies,
    //   imageUrl
    // } = req.body;

    // ...validation and single-product creation here...


    const products = req.body;

    // Check if body is an array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array of product objects." });
    }

    const addedProducts = [];

    for (const product of products) {
      const {
        name,
        type,
        measurement,
        quantity,
        calories,
        price,
        dietaryPreference,
        allergies,
        imageUrl
      } = product;

      // Validate required fields
      if (
        !name || typeof name !== "string" || name.trim() === "" ||
        !Array.isArray(type) || type.length === 0 ||
        !Array.isArray(dietaryPreference) || dietaryPreference.length === 0 ||
        quantity == null || isNaN(quantity) || Number(quantity) <= 0 ||
        calories == null || isNaN(calories) || Number(calories) <= 0 ||
        price == null || isNaN(price) || Number(price) < 0 ||
        !Array.isArray(allergies)
      ) {
        console.warn(`Skipping invalid product: ${name || "Unnamed"}`);
        continue; // Skip invalid product
      }

      const normalizedType = type.map(t => t.trim().toLowerCase());
      const normalizedDiet = dietaryPreference.map(d => d.trim().toLowerCase());
      const normalizedAllergies = allergies.map(a => a.trim().toLowerCase());

      const existingProduct = await Product.findOne({
        name: name.trim(),
        measurement: measurement?.trim() || null,
        dietaryPreference: { $in: normalizedDiet }
      });

      if (existingProduct) {
        console.warn(`Product "${name}" already exists for one of the given dietary preferences. Skipping.`);
        continue; // Skip duplicates
      }

      const newProduct = new Product({
        name: name.trim(),
        type: normalizedType,
        measurement: measurement?.trim() || undefined,
        quantity: Number(quantity),
        calories: Number(calories),
        price: Number(price),
        dietaryPreference: normalizedDiet,
        allergies: normalizedAllergies,
        imageUrl
      });

      const savedProduct = await newProduct.save();
      addedProducts.push(savedProduct);
    }

    res.status(201).json({
      message: `${addedProducts.length} product(s) added successfully.`,
      products: addedProducts
    });

  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Route handler
productRouter.get("/suggest", async (req, res) => {
  try {
    const { dietaryPreference, allergies, calories, userId } = req.query;

    // 1️⃣ validate dietaryPreference
    if (!dietaryPreference) {
      return res.status(400).json({ message: "Dietary preference is required." });
    }
    const dietPrefs = dietaryPreference.split(",").map(d => d.trim().toLowerCase());
    const validPrefs = ["veg", "non-veg", "vegan"];
    const invalidPrefs = dietPrefs.filter(d => !validPrefs.includes(d));
    if (invalidPrefs.length) {
      return res.status(400).json({ message: `Invalid dietary preference(s): ${invalidPrefs.join(", ")}` });
    }

    // 2️⃣ validate allergies
    const allowedAllergies = ["nuts", "gluten", "dairy", "eggs"];
    const allergyList = allergies ? allergies.split(",").map(a => a.trim().toLowerCase()) : [];
    const invalidAllergies = allergyList.filter(a => !allowedAllergies.includes(a));
    if (invalidAllergies.length) {
      return res.status(400).json({
        message: `Invalid allergy value(s): ${invalidAllergies.join(", ")}. Allowed values: ${allowedAllergies.join(", ")}.`
      });
    }

    // 3️⃣ calorie split per meal
    const totalCalories = parseInt(calories);
    const calorieSplit = {
      breakfast: Math.round(totalCalories / 3),
      lunch:     Math.round(totalCalories / 3),
      dinner:    totalCalories - 2 * Math.round(totalCalories / 3)
    };

    const requestedTypes = ["breakfast", "lunch", "dinner"];
    const suggestions = {};

    // 4️⃣ fetch products (now with the *entire* product body)
    for (const type of requestedTypes) {
      const query = { type, dietaryPreference: { $in: dietPrefs } };
      if (allergyList.length) query.allergies = { $nin: allergyList };

      const products = await Product.find(query).lean(); // ← full documents
      const targetCalories = calorieSplit[type];
      suggestions[type] = selectProductsForCalories(products, targetCalories);
    }

    // 5️⃣ summarise calories selected
    const selectedCalories = {};
    for (const type of requestedTypes) {
      selectedCalories[type] = suggestions[type].reduce((sum, p) => sum + p.calories, 0);
    }

    // 6️⃣ optionally attach suggestions to user
    if (userId) await addProductsToUser(userId, suggestions);

    // 7️⃣ response
    res.status(200).json({
      suggestions,                           // full product objects here ✅
      filtersApplied: {
        dietaryPreference: dietPrefs,
        excludedAllergies: allergyList,
        caloriesPerMeal: selectedCalories
      }
    });
  } catch (err) {
    console.error("Error suggesting meals:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// helper
function selectProductsForCalories(products, targetCalories) {
  const sorted = [...products].sort((a, b) => b.calories - a.calories);
  const selected = [];
  let total = 0;

  for (const product of sorted) {
    if (total + product.calories <= targetCalories * 1.1) { // allow 10 % wiggle room
      selected.push(product);
      total += product.calories;
      if (total >= targetCalories * 0.9) break;              // stop at ≥ 90 % target
    }
  }
  return selected;
}


async function addProductsToUser(userId, combo) {
  try {
    const productSet = {};

    if (combo.breakfast && combo.breakfast.length > 0) {
      productSet.breakfast = combo.breakfast.map(item => item._id);
    }

    if (combo.lunch && combo.lunch.length > 0) {
      productSet.lunch = combo.lunch.map(item => item._id);
    }

    if (combo.dinner && combo.dinner.length > 0) {
      productSet.dinner = combo.dinner.map(item => item._id);
    }

    if (Object.keys(productSet).length === 0) {
      console.log("No valid meals to update for user.");
      return null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { products: productSet } },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating user with suggested products:", error);
    throw error;
  }
}


productRouter.get("/all", async (req, res) => {
  try {
    const products = await Product.find()
    if (!products) {
      return res.status(411).json({
        message: "no products found"
      })
    }
    return res.status(200).json({
      message: "Products found",
      products: products
    })
  }
  catch (err) {
    console.error("Cannot get products", err)
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
})

productRouter.get("/get/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(401).json({
        message: "Product does not exist"
      })
    }

    return res.status(200).json({
      message: "Product found",
      product: existingProduct
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: "Error fetching product",
      error: err.message
    })
  }
})

//check call
productRouter.post('/getProducts', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    return res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

productRouter.get('/filterProducts', async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(409).json({
        message: "Please provide type"
      })
    }

    const validTypes = ['breakfast', 'lunch', 'dinner']
    const typeArray = Array.isArray(type)
      ? type
      : type.split(",").map((t) => t.trim().toLowerCase());

    const invalidTypes = typeArray.filter((t) => !validTypes.includes(t));
    if (invalidTypes.length > 0) {
      return res.status(409).json({
        message: "Please pass in valid type",
        error: `Invalid types : ${invalidTypes.join(",")} . Allowed Types are ${validTypes.join(",")}`
      })
    }

    const filteredProducts = await Product.find({ type: { $in: typeArray } });

    if (filteredProducts.length == 0) {
      return res.status(409).json({
        message: "No filtered products found"
      })
    }

    return res.status(200).json({
      message: "Products found",
      filteredProducts,
      count : filteredProducts.length
    })

  } catch (err) {
    return res.status(500).json({
      message: "Error while fetching filtered products",
      error: err.message
    })
  }
})


productRouter.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // === ID Validation ===
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    // === Body Null Check ===
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: "No update data provided." });
    }

    const allowedFields = [
      "name",
      "type",
      "measurement",
      "quantity",
      "calories",
      "price",
      "dietaryPreference",
      "allergies",
      "imageUrl"
    ];

    const validatedUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] != null) { // null or undefined check
        if (Array.isArray(updates[key])) {
          validatedUpdates[key] = updates[key].map((val) =>
            typeof val === "string" ? val.trim().toLowerCase() : val
          );
        } else if (typeof updates[key] === "string") {
          validatedUpdates[key] = updates[key].trim();
        } else {
          validatedUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: validatedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


productRouter.delete('/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(409).json({
        message: "Plesase pass in valid Id"
      })
    }

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(409).json({
        message: "Product not found"
      })
    }

    return res.status(200).json({
      message: "Product deleted successfully"
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Error while deleting product",
      message: err.message
    })
  }
})


productRouter.get("/count", async (req, res) => {
  try {
    const count = await Product.countDocuments();

    return res.status(200).json({
      message: "Product count fetched successfully",
      count
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching Product count",
      error: err.message
    });
  }
});
