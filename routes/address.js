import express from 'express'

export const addressRouter = express.Router()

addressRouter.post("/" , (req , res) => {
    res.json({
        message : "address route added"
    })
})