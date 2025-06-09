import express from 'express'
import { sampleSub, subscription } from '../models/subscription.model.js';

export const subscriptionRouter = express.Router()

subscriptionRouter.post('/add' , async (req , res) => {
     try {
    const {userId ,  sampleSubId, startdate } = req.body;

    if (!userId || !sampleSubId || !startdate) {
      return res.status(400).json({ message: "sampleSubId and startdate are required." });
    }

    
    const existingSample = await sampleSub.findById(sampleSubId);
    if (!existingSample) {
      return res.status(404).json({ message: "Sample subscription not found." });
    }

    const newSubscription = new subscription({
        userId,
      sampleSubId,
      startdate: new Date(startdate),
    });

    const savedSubscription = await newSubscription.save();

    return res.status(201).json({
      message: "Subscription created successfully.",
      subscription: savedSubscription,
    });
  } catch (error) {
    console.error("Error adding subscription:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
})


subscriptionRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userSubscriptions = await subscription
      .find({ userId })
      .populate("sampleSubId")
      .populate("userId", "name email");

    res.status(200).json(userSubscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Server error" });
  }
});
