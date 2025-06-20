import express from 'express'
import {userRouter} from "./user.js"
import { productRouter } from './product.js'
import { sampleSubscriptionRouter } from './samplesubscription.js'
import { subscriptionRouter } from './subscription.js'
import { authRouter } from './auth.js'
import { addressRouter } from './address.js'
import adminRouter from './admin.js'

//routes/index.js , handles all the requests coming to /api/v1
export const rootRouter = express.Router()

rootRouter.use("/user" , userRouter)
rootRouter.use("/admin" , adminRouter)
rootRouter.use("/product" , productRouter)
rootRouter.use("/sampleSubscription" , sampleSubscriptionRouter)
rootRouter.use("/subscription" , subscriptionRouter)
rootRouter.use("/auth" , authRouter)
rootRouter.use("/address" , addressRouter)