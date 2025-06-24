import express from 'express'
import { sampleSub } from '../models/subscription.model.js'
import { User } from '../models/user.model.js'


export const sampleSubscriptionRouter = express.Router()

/*
    handles requests to /api/v1/sampleSubscription

    1. sampleSubscription/add ---> add a sample Subscription
    2. samplesSubscription/get:id ---> get a sample Subscription by pasing in the id
*/

sampleSubscriptionRouter.post("/add" , async (req , res ) => {

    try {
        const {planDuration , mealsPerDay , price ,
        mealTypes , numberOfDays , dietaryPreference 
    } = req.body

    if (!planDuration ||! mealsPerDay  ||
        !mealTypes || !numberOfDays || !dietaryPreference ) {
        return res.status(409).json({
            message : "enter valid inputs "
        })
    }

    const existingSub = await sampleSub.findOne({
          planDuration , mealsPerDay , mealTypes ,
        numberOfDays , dietaryPreference
    })
    if(existingSub){
        return res.status(409).json({
            message : "Subscription already exists"
        })
    }
    const newSub = new sampleSub({
        planDuration , mealsPerDay , price ,
        mealTypes , numberOfDays , dietaryPreference
    })

    const finalSub = await newSub.save()

    
    return res.status(201).json({
        message : "Subscription added",
        subscription : finalSub
    })
    }
    catch(error) {
        console.error("Errow while adding subscription" , error);
        return res.status(500).json({
            message : "Error in subscription"
        })
    }
} )
 

sampleSubscriptionRouter.get("/get", async (req, res) => {
  try {
    const {
      planDuration,
      mealsPerDay,
      mealTypes,
      numberOfDays,
      dietaryPreference,
      userId
    } = req.query;
    
    if (
      !planDuration ||
      !mealsPerDay ||
      !mealTypes ||
      !numberOfDays ||
      !dietaryPreference
    ) {
      return res.status(400).json({
        message: "Missing required query parameters"
      });
    }

   
    const mealTypesArray = Array.isArray(mealTypes)
      ? mealTypes
      : mealTypes.split(",");
    const dietaryPreferenceArray = Array.isArray(dietaryPreference)
      ? dietaryPreference
      : dietaryPreference.split(",");

    
    const query = {
        planDuration: planDuration.trim().toLowerCase(),
        mealsPerDay: Number(mealsPerDay),
        numberOfDays: Number(numberOfDays),
        mealTypes: { $all: mealTypesArray },
        dietaryPreference: { $all: dietaryPreferenceArray }
    };

    const results = await sampleSub.find(query);

    if (!results.length) {
      return res.status(404).json({
        message: "No matching sample subscriptions found"
      });
    }

    // Create user preferences object with actual arrays, not query operators
    const userPreferences = {
      planDuration: planDuration.trim().toLowerCase(),
      mealsPerDay: Number(mealsPerDay),
      numberOfDays: Number(numberOfDays),
      mealTypes: mealTypesArray,  // Store actual array
      dietaryPreference: dietaryPreferenceArray  // Store actual array
    };
    console.log("About to update user:", userId);
    console.log("User preferences:", userPreferences);

    // Only update user if userId is provided
    if (userId) {
      await updateUser(userId, userPreferences);
    }

    res.status(200).json({
      message: "Matching subscriptions found",
      subscriptions: results 
    });
  } catch (error) {
    console.error("Error in GET /sampleSubscription/get:", error);
    res.status(500).json({
      message: "Server error while fetching sample subscriptions"
    });
  }
});

async function updateUser(userId, userPreferences) {
  console.log("updateUser called with:", userId, userPreferences);
  try {
    console.log("About to execute findByIdAndUpdate...");
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          mealData: {
            planDuration: userPreferences.planDuration,
            mealTypes: userPreferences.mealTypes,
            mealsPerDay: userPreferences.mealsPerDay,
            numberOfDays: userPreferences.numberOfDays,
            dietaryPreference: userPreferences.dietaryPreference
          }
        }
      },
      { new: true }
    );

    console.log("MongoDB operation completed. Result:", updatedUser);

    if (!updatedUser) {
      console.log("No user found with ID:", userId);
      throw new Error("User not found");
    }

    console.log("User updated successfully:", updatedUser._id);
    return updatedUser;
  } catch (error) {
    console.error("Error updating user with preferences:", error);
    throw error;
  }
}