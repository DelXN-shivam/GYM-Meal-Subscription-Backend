import express from 'express'
import {rootRouter} from './routes/index.js';
import connectDB from './utils/db.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Server is running successfully!' });
});

// API routes
app.use('/api/v1', rootRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
