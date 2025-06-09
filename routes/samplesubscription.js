import express from 'express'
import { sampleSub } from '../models/subscription.model.js'

export const samplesubscriptionRouter = express.Router()
samplesubscriptionRouter.post("/add" , async (req , res ) => {

    try {
        const {planduration , mealsperday , price ,
        mealtypes , numberofdays , dietarypreference , 
    } = req.body

    if (!planduration ||! mealsperday || !price ||
        !mealtypes || !numberofdays || !dietarypreference ) {
        return res.status(409).json({
            message : "enter valid inputs "
        })
    }

    const existingSub = await sampleSub.findOne({
        price , planduration , mealsperday , mealtypes ,
        numberofdays , dietarypreference
    })
    if(existingSub){
        return res.status(409).json({
            message : "Subscription already exists"
        })
    }
    const newSub = new sampleSub({
        planduration , mealsperday , price ,
        mealtypes , numberofdays , dietarypreference
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



samplesubscriptionRouter.get("/:id", async (req, res) => {
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
