import express from 'express'
import {userRouter} from "./user.js"
import { productRouter } from './product.js'
import { sampleSubscriptionRouter } from './samplesubscription.js'
import { subscriptionRouter } from './subscription.js'
import authRouter from './auth.js'

export const rootRouter = express.Router()

rootRouter.use("/user" , userRouter)
rootRouter.use("/product" , productRouter)
rootRouter.use("/sampleSubscription" , sampleSubscriptionRouter)
rootRouter.use("/subscription" , subscriptionRouter)
rootRouter.use("/auth" ,authRouter )