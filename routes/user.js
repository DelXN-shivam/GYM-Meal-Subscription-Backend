import express from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/user.model.js'
import { validate } from '../middleware/validateUserInput.js'
export const userRouter = express.Router()


/*
  user.js file , user registration and
  calculation of required calories for the user along with macros

  1. /api/v1/user/register  ----> user registration

  2. /api/v1/user/calculate-calories  ---->  calculate calories of the user
*/
userRouter.post('/register', validate, async (req, res) => {

  //required inputs given below
  try {
    const { name, email, password, contactNo } = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //find existing user
    const existingUser = await User.findOne({
      email: email
    })

    if (existingUser) {
      return res.status(500).json({
        message: "User already exists"
      })
    }

    //else create new User 
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactNo
    });

    const finalUser = await newUser.save()

    res.status(200).json({
      message: "User registered successfully",
      User: finalUser,
      name: name,
      email: email,
      originalPassword: password,
      contactNo: contactNo,
    })
  }

  catch (err) {
    console.log(err)
    res.status(500).json({
      message: "User registration failed",
      error: err.message
    })

  }
})

userRouter.post("/calculate-calories", async (req, res) => {
  const { gender, weight, height, age, activityLevel, goal, userId } = req.body;
  console.log("inside calories");

  try {
    // === Validate required fields ===
    if (!gender || !weight || !height || !age || !activityLevel || !goal || !userId) {
      return res.status(400).json({ message: "All fields including userId are required" });
    }

    const validGenders = ["male", "female"];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({ message: "Invalid gender value. Accepted values are: male, female, or other." });
    }

    // === Perform calculations ===
    const bmr = calculateBMR(gender, weight, height, age);
    const activityMultiplier = getActivityMultiplier(activityLevel);
    const tdee = bmr * activityMultiplier;
    const adjustedCalories = applyGoalAdjustment(tdee, goal.toLowerCase());
    const bmi = calculateBMI(weight, height);
    const macros = calculateMacros(adjustedCalories, goal.toLowerCase());

    // === Update user nutrients ===
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        nutrients: {
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          recommendedCalories: Math.round(adjustedCalories),
          bmi: bmi,
          macroNutrients: macros,
        },
      },
      { new: true }
    );

    res.json({
      message: "Nutritional data calculated and saved",
      nutrients: updatedUser.nutrients,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


//BMI complete calculation
function calculateBMI(weight, heightCm) {
  if (!weight || !heightCm) {
    throw new Error("Weight and height are required.");
  }

  const heightInMeters = heightCm / 100;
  const bmi = weight / (heightInMeters ** 2);

  return parseFloat(bmi.toFixed(2));
}

// BMR calculation
function calculateBMR(gender, weight, height, age) {
  const base = 10 * weight + 6.25 * height - 5 * age;

  switch (gender.toLowerCase()) {
    case "male":
      return base + 5;
    case "female":
      return base - 161;
    // case "other":
    //   return base - 78; // Average of male and female: (5 - 161) / 2 = -78
    default:
      throw new Error("Invalid gender value.");
  }
}


function getActivityMultiplier(level) {
  const map = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725,
  };
  return map[level.toLowerCase()] || 1.2;
}

function applyGoalAdjustment(tdee, goal) {
  switch (goal.toLowerCase()) {
    case "lose-weight":
      return tdee - 500;
    case "muscle-gain":
      return tdee + 500;
    case "maintain":
    default:
      return tdee;
  }
}

function calculateMacros(calories, goal) {
  let proteinPct, carbsPct, fatsPct;

  switch (goal) {
    case "lose-weight":
      proteinPct = 0.4;
      carbsPct = 0.3;
      fatsPct = 0.3;
      break;
    case "muscle-gain":
      proteinPct = 0.35;
      carbsPct = 0.4;
      fatsPct = 0.25;
      break;
    default: // maintain
      proteinPct = 0.3;
      carbsPct = 0.4;
      fatsPct = 0.3;
  }

  return {
    protein: proteinPct * 100,
    carbs: carbsPct * 100,
    fats: fatsPct * 100
  };
}

// userRouter.put("/update/:id" , async ( req, res ) => {
userRouter.patch("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userExists = await User.findById(id);

    if (!userExists) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Filter out empty, null, or undefined fields
    let updateData = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid data provided to update." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Full Error:", err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});


// userRouter.get("/all" )
userRouter.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    
    return res.json({
      message: "User data fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching Users",
      error: error.message
    });
  }
});

userRouter.get("/get/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(401).json({
        message: "User does not exist"
      })
    }

    return res.status(200).json({
      message: 'User Found',
      user: existingUser
    })

  }
  catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error fetching User",
      error: err.message
    })
  }
})


userRouter.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();

    return res.status(200).json({
      message: "User count fetched successfully",
      count
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching user count",
      error: err.message
    });
  }
});
