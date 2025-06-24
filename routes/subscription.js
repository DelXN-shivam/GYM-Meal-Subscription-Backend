import express from 'express'
import mongoose  from 'mongoose';
import { sampleSub, subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';

export const subscriptionRouter = express.Router()

subscriptionRouter.post('/add', async (req, res) => {
  try {
    const { userId, sampleSubId, startDate } = req.body;

    // Input validation
    if (!userId || !sampleSubId || !startDate) {
      return res.status(400).json({ 
        message: "userId, sampleSubId and startDate are required." 
      });
    }

    // Check for existing active subscription
    const existingActiveSubscription = await subscription.findOne({ 
      userId,
      status : "active",
      endDate: { $gt: new Date() } 
    });
    
    if (existingActiveSubscription) {
      return res.status(400).json({ 
        message: "User already has an active subscription.",
        existingSubscription: existingActiveSubscription
      });
    }

    // Verify sample subscription exists
    const existingSample = await sampleSub.findById(sampleSubId);
    if (!existingSample) {
      return res.status(404).json({ 
        message: "Sample subscription not found." 
      });
    }

    const numberOfDays = existingSample.numberOfDays

    // Map string duration to number of days
      

    // Create new subscription
    const newSubscription = new subscription({
      userId,
      sampleSubId,
      startDate: new Date(startDate),
      endDate: calculateEndDate(new Date(startDate), existingSample.planDuration),
      planDuration: existingSample.planDuration, 
      numberOfDays : numberOfDays,
      status: "active"
    });

    // Save subscription and update user in a transaction
    const session = await mongoose.connection.startSession();
    session.startTransaction();
    
    try {
      const savedSubscription = await newSubscription.save({ session });

      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            subscriptions: {
              subscriptionId: savedSubscription._id,
              sampleSubId: sampleSubId,
              startDate: new Date(startDate),
              endDate : savedSubscription.endDate,
              status: 'active'
            }
          }
        },
        { session, new: true }
      );

      await session.commitTransaction();
      
      return res.status(201).json({
        message: "Subscription created and user updated successfully.",
        subscription: savedSubscription
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error("Error adding subscription:", error);
    return res.status(500).json({ 
      message: "Internal server error.",
      error: error.message 
    });
  }
});

// Helper function to calculate end date
function calculateEndDate(startDate, planDuration) {
  const durationMap = {
    weekly: 7,
    monthly: 30
  };
  const days = durationMap[planDuration] || 7;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  return endDate;
}

subscriptionRouter.get("/get/:id" , async (req , res) => {
  try {
    const subscriptionId = req.params.id;

  const existingSubscription = await subscription.findById(subscriptionId)

  if(!existingSubscription){
    return res.status(401).json({
      message : "Subscription does not exist "
    })
  }

  return res.status(200).json({
    message : "Subscription found",
    subscription : existingSubscription
  })
  } catch (err){
    console.log(err);
    return res.status(500).json({
      message : "Error while fetching subscription",
      error : err.message
    })
  }
})