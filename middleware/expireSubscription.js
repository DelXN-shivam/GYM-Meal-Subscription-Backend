import cron from "node-cron";
import { subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js"; // Make sure this path is correct

export const expireOldSubscriptions = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      // Find all active subscriptions that have expired
      const expiredSubscriptions = await subscription.find({
        endDate: { $lt: now },
        status: "active"
      });

      const expiredIds = expiredSubscriptions.map((sub) => sub._id);

      if (expiredIds.length === 0) {
        console.log("[CRON] No subscriptions to expire.");
        return;
      }

      // Update the status in the Subscription collection
      const subscriptionResult = await subscription.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "expired" } }
      );

      // Update the status in the User.subscriptions array
      const userResult = await User.updateMany(
        { "subscriptions.subscriptionId": { $in: expiredIds } },
        {
          $set: { "subscriptions.$[elem].status": "expired" }
        },
        {
          arrayFilters: [{ "elem.subscriptionId": { $in: expiredIds } }]
        }
      );

      console.log(`[CRON] Expired ${subscriptionResult.modifiedCount} subscriptions.`);
      console.log(`[CRON] Updated ${userResult.modifiedCount} users' embedded subscriptions.`);

    } catch (err) {
      console.error("[CRON ERROR] Failed to update expired subscriptions:", err);
    }
  });
};
