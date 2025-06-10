import express from 'express'
import { sampleSub } from '../models/subscription.model.js'

export const sampleSubscriptionRouter = express.Router()
sampleSubscriptionRouter.post("/add" , async (req , res ) => {

    try {
        const {planDuration , mealsPerDay , price ,
        mealTypes , numberOfDays , dietaryPreference , 
    } = req.body

    if (!planDuration ||! mealsPerDay || !price ||
        !mealTypes || !numberOfDays || !dietaryPreference ) {
        return res.status(409).json({
            message : "enter valid inputs "
        })
    }

    const existingSub = await sampleSub.findOne({
        price , planDuration , mealsPerDay , mealTypes ,
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
