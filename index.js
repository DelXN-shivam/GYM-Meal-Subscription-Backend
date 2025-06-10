import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())

await connectDB()

import {rootRouter} from './routes/index.js';
import connectDB from './utils/db.js'

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Server is running successfully!' });
});

app.use('/api/v1' , rootRouter)

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;