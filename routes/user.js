import express from 'express'
import bcrypt from 'bcrypt'
import {User} from '../models/user.model.js'
import { validate } from '../middleware/validateUserInput.js'
import { verifyAdminToken } from '../middleware/adminAuth.js'
export const userRouter = express.Router()


/*
  user.js file , user registration and
  calculation of required calories for the user along with macros

  1. /api/v1/user/register  ----> user registration

  2. /api/v1/user/calculate-calories  ---->  calculate calories of the user
*/
userRouter.post('/register' , validate , async (req , res) => {
   
    //required inputs given below
    try {
        const {name,email, password, contactNo} = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password ,salt)
    
    //find existing user
    const existingUser = await User.findOne({
      email : email
    })

    if(existingUser) {
      return res.status(500).json({
        message : "User already exists"
      })
    }

    //else create new User 
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactNo
    });

   const finalUser =  await newUser.save()

    res.status(200).json({
        message : "User registered successfully" , 
        User : finalUser,
        name : name,
        email : email,
        originalPassword : password,
        contactNo : contactNo,
    })
    }

    catch(err){
        console.log(err)
        res.status(500).json({
            message : "User registration failed",
            error : err.message
        })
        
    }
})

userRouter.post("/calculate-calories", (req, res) => {
  
  //required inputs given below
  const { gender, weight, height, age, activityLevel, goal } = req.body;

  try {
    if (!gender || !weight || !height || !age || !activityLevel || !goal) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //calculate BMR 
    const bmr = calculateBMR(gender, weight, height, age);
    const activityMultiplier = getActivityMultiplier(activityLevel);
    const tdee = bmr * activityMultiplier;
    const adjustedCalories = applyGoalAdjustment(tdee, goal.toLowerCase());
    const BMI = calculateBMI(weight , height)
    const macros = calculateMacros(adjustedCalories , goal.toLowerCase())
    res.json({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories: Math.round(adjustedCalories),
      bmi : BMI ,
      macronutients : macros
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//BMI calculation 
function calculateBMI(weight, heightCm) {
  if (!weight || !heightCm) {
    throw new Error("Weight and height are required.");
  }

  const heightInMeters = heightCm / 100;
  const bmi = weight / (heightInMeters ** 2);

  return bmi.toFixed(2); 
}

// BMR calculation
function calculateBMR(gender, weight, height, age) {
  return gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
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
    protein: {
      percentage: proteinPct * 100
    },
    carbs: {
      percentage: carbsPct * 100
    },
    fats: {
      percentage: fatsPct * 100
    }
  };
}

userRouter.put("/update/:id" , async ( req, res ) => {
// userRouter.patch("/update/:id" , async ( req, res ) => {
  try {
    const id = req.params.id;
    const userExists = await User.findById(id);

    if (!userExists) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Prepare update data
    let updateData = { ...req.body };

    // If image is uploaded, add filename to user profile
    if (req.file) {
      updateData.profileImage = req.file.filename; // or req.file.id if you prefer storing ID
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error("Full Error:", err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// userRouter.get("/all" , verifyAdminToken,  async ( req, res ) => {
userRouter.get("/all", async (req, res) => {
  try {
    console.log("inside user/all");

    // Get page and limit from query params, with defaults
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 2; // Users per page

    // Calculate how many users to skip
    const skip = (page - 1) * limit;

    // Fetch users with skip and limit
    const users = await User.find().skip(skip).limit(limit);

    // Get total number of users to calculate total pages
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.json({
      message: "User data fetched successfully",
      data: users,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching Users",
      error: error.message
    });
  }
});
