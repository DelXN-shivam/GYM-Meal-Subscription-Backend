import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URL);
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }
};

export default connectDB;
