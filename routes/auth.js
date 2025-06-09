// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});

export default authRouter;
