import express from 'express'
import { sampleSub, subscription } from '../models/subscription.model.js';

export const subscriptionRouter = express.Router()

subscriptionRouter.post('/add', async (req, res) => {
  try {
    const { userId, sampleSubId, startDate } = req.body;

    if (!userId || !sampleSubId || !startDate) {
      return res.status(400).json({ message: "userId, sampleSubId and startDate are required." });
    }

    // Check if user already has an active subscription
    const existingUserSubscription = await subscription.findOne({ userId });
    if (existingUserSubscription) {
      return res.status(400).json({ 
        message: "User already has an active subscription.",
        existingSubscription: existingUserSubscription
      });
    }

    const existingSample = await sampleSub.findById(sampleSubId);
    if (!existingSample) {
      return res.status(404).json({ message: "Sample subscription not found." });
    }

    const newSubscription = new subscription({
      userId,
      sampleSubId,
      startDate: new Date(startDate),
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
});


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
