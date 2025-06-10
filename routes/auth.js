// routes/auth.js
import express from "express";
import bcrypt from 'bcrypt';
import { User } from "../models/user.model.js";
import { validateSignIn } from "../middleware/validateUserSignIn.js";

export const authRouter = express.Router();

authRouter.post("/login", validateSignIn , async (req, res) => {
    try {
        const { email, password } = req.body;

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

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
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