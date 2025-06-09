import express from 'express'
import {userRouter} from "./user.js"
import { productRouter } from './product.js'
import { samplesubscriptionRouter } from './samplesubscription.js'
import { subscriptionRouter } from './subscription.js'

export const rootRouter = express.Router()

rootRouter.use("/user" , userRouter)
rootRouter.use("/product" , productRouter)
rootRouter.use("/sampleSubscription" , samplesubscriptionRouter)
rootRouter.use("/subscription" , subscriptionRouter)