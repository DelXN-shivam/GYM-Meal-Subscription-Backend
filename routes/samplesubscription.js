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
        mealTypes , numberOfDays , dietaryPreference , userId
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

    await updateUser(userId , finalSub)
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


async function updateUser(userId , finalSub){
    try {
    const updatedUser = await User.findByIdAndUpdate(
        userId ,
    {
        $push : {
            mealData : {
                mealTypes : finalSub.mealTypes,
                mealsPerDay : finalSub.mealsPerDay,
                numberOfDays : finalSub.numberOfDays,
                dietaryPreference : finalSub.dietaryPreference
            }
        }

    } , { new : true} )

    return updateUser 
} catch (error) {
    console.error("Error updating user with suggested products:", error);
    throw error;
  }
}   


sampleSubscriptionRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await sampleSub.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: "Sample subscription not found." });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error fetching sample subscription:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
