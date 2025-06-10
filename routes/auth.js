// routes/auth.js
import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);
        
        if (!matchPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email
                }
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

export default authRouter;