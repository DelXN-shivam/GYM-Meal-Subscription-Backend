import mongoose from "mongoose";

//user schema for register
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    originalPassword: {
      type: String,
      required: false,
    },
    height: {
      type: Number, // in cm
      required: false,
    },
    weight: {
      type: Number, // in kg
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "Other"],
      required: false,
    },
    contactNo: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    homeAddress: {
      type: String,
      required: false,
    },
    officeAddress: {
      type: String,
      required: false,
    },
    collegeAddress: {
      type: String,
      required: false,
    },
    fitnessGoal: {
      type: String,
      required: false,
      enum: ["lose-weight", "muscle-gain", "maintain"],
    },
    dietPreference: {
      type: [String],
      required: false,
      enum: ["veg", "non-veg", "vegan"],
    },
    // allergy: {
    //   type: String,
    //   required: false
    // },
    allergy: {
      type: [String],
      required: false,
      enum: ["nuts", "gluten", "dairy", "eggs", "other"],
    },
    activityLevel: {
      type: String,
      required: false,
      enum: ["active", "sedentary", "moderate"],
    },
    mealData: {
      mealPerDay: {
        type: Number,
      },
      mealTypes: {
        type: [String],
        enum: ["breakfast", "lunch", "dinner"],
      },
      numberOfDays: {
        type: Number,
        enum: [5, 7],
      },
      dietaryPreference: {
        type: [String],
        enum: ["veg", "non-veg", "vegan"],
      },
    },
    products: {
      type: [
        {
          breakfast: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              // validate: [
              //   (arr) => arr.length <= 3,
              //   "Breakfast can have at most 3 products",
              // ],
            },
          ],
          lunch: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              validate: [
                (arr) => arr.length <= 3,
                "Lunch can have at most 3 products",
              ],
            },
          ],
          dinner: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              // validate: [
              //   (arr) => arr.length <= 3,
              //   "Dinner can have at most 3 products",
              // ],
            },
          ],
        },
      ],
    },
    subscriptions: [
      {
        subscriptionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subscription",
        },
        sampleSubId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SampleSubscription",
        },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["active", "expired", "paused"],
        },
      },
    ],
    addressDetails: {
      defaultAddress: {
        type: String,
        required: false,
        enum: ["home", "office", "college"],
      },
      actualAddress: {
        type: String,
        required: false,
      },
      deliveryDate: {
        type: Date,
        required: false,
      },
      customAddress: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
