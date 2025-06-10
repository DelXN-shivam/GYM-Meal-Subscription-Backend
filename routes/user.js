import express from 'express'
import bcrypt from 'bcrypt'
import {User} from '../models/user.model.js'
export const userRouter = express.Router()

userRouter.post('/register' , async (req , res) => {
    try {
        const {name,email, password, height, weight, gender, contactNo,
      homeAddress, officeAddress, collegeAddress, activityLevel,
      fitnessGoal, dietPreference, allergy} = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password ,salt)
    
    const existingUser = await User.findOne({
      email : email , 
      password : password
    })

    if(existingUser) {
      return res.status(500).json({
        message : "User already exists"
      })
    }
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      height,
      weight,
      gender,
      contactNo,
      homeAddress,
      officeAddress,
      collegeAddress,
      fitnessGoal,
      dietPreference,
      activityLevel,
      allergy
    });

    await newUser.save()

    res.status(200).json({
        message : "User registered successfully" , 
        UserId : newUser._id
    })
    }

    catch(err){
        console.log(err)
        res.status(500).json({
            message : "User registration failed"
        })
    }
})

userRouter.post("/calculate-calories", (req, res) => {
  const { gender, weight, height, age, activityLevel, goal } = req.body;

  try {
    if (!gender || !weight || !height || !age || !activityLevel || !goal) {
      return res.status(400).json({ message: "All fields are required" });
    }

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


