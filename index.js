import express from 'express'
const app = express()
const PORT = process.env.PORT
app.use(express.json())

await connectDB()

import {rootRouter} from './routes/index.js';
import connectDB from './utils/db.js'

app.use('/api/v1' , rootRouter)

app.listen(PORT)