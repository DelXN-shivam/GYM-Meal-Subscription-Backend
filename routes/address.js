import express from 'express';
import { validateAddress } from '../middleware/validateAddressInput.js';
import { User } from '../models/user.model.js';

export const addressRouter = express.Router();

addressRouter.post("/add/:userId", validateAddress, async (req, res) => {
  try {
    const {
      defaultAddress,
      customAddress,
      actualAddress,
      deliveryDate
    } = req.body;
    const { userId } = req.params;
    
    // Debug logs
    console.log("UserId:", userId);
    console.log("Request Body:", req.body);
    console.log("Address Details to Update:", {
      defaultAddress,
      actualAddress,
      deliveryDate,
      customAddress
    });

    // Check if user exists first
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    console.log("User found, current addressDetails:", userExists.addressDetails);

    // Method 1: Using $set (your current approach)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "addressDetails.defaultAddress": defaultAddress,
          "addressDetails.actualAddress": actualAddress,
          "addressDetails.deliveryDate": deliveryDate,
          "addressDetails.customAddress": customAddress
        }
      },
      { 
        new: true,
        runValidators: true // This ensures schema validations run
      }
    );

    console.log("Updated user addressDetails:", updatedUser.addressDetails);

    res.status(200).json({
      message: "Address updated successfully",
      addressDetails: updatedUser.addressDetails,
      updatedUser
    });

  } catch (err) {
    console.error("Error while adding address:", err);
    return res.status(500).json({
      message: "Error while adding address",
      error: err.message
    });
  }
});