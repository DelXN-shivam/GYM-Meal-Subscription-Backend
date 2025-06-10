import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
  },
    sampleSubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SampleSub", 
        required: true,
  } ,
    startDate : {
        type : Date ,
        required : true
    }
} , {timestamps : true})


const sampleSubscription = new mongoose.Schema({
    planDuration : {
        type : String,
        enum : ["weekly" , "monthly"],
        required : true,
        trim : true , 
        lowercase : true
    } , 
    mealsPerDay : {
        type : Number,
        enum : [ 1 , 2 , 3 ],
        required : true
    } , 
    price : {
        type : Number,
        required : true
    } ,
    mealTypes : {
        type : [String],
        enum : ["breakfast" , "lunch" , "dinner"],
        required : true,
        lowercase : true,
        trim : true
    } , 
    numberOfDays : {
        type : Number,
        enum : [ 5 , 7 ],
        required : true
    } , 
    dietaryPreference : {
        type : [String],
        enum : ["veg" , "non-veg" , "vegan"],
        lowercase : true,
        required : true,
        trim : true
    }
   
} , {timestamps : true})

export const sampleSub = mongoose.model("SampleSub" , sampleSubscription)

export const subscription = mongoose.model("Subscription" , subscriptionSchema)