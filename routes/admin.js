// routes/admin.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import bcrypt, { genSalt } from 'bcrypt'

const adminRouter = express.Router();

// Generate JWT
const generateToken = (admin) => {
    return jwt.sign(
        { id: admin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Admin Signup
adminRouter.post('/signup', async (req, res) => {
    const {  userId, password } = req.body;

    try {
        const adminExists = await Admin.findOne({ userId });
        if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const newAdmin = await Admin.create({ userId, password : hashedPassword });

        const token = generateToken(newAdmin);

        res.status(201).json({
            message: 'Admin created successfully',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Admin Login
adminRouter.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        const admin = await Admin.findOne({ userId });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        const isPasswordCorrect = await bcrypt.compare(password , admin.password)
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(admin); 

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default adminRouter;
