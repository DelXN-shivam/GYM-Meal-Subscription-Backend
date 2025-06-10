// routes/auth.js
import express from "express";
import bcrypt from 'bcrypt'
import { User } from "../models/user.model.js";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  /*const { email, password } = req.body;

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
*/
   try {
    const {email , password} = req.body;

    const existingUser = await User.findOne({email})

    if(!existingUser){
        return res.status(401).json({
            message : "User does not exist"
        })
    }

    const matchPassword = await bcrypt.compare(password , existingUser.password)
    if(!matchPassword){
        return res.status(401).json({
            message : "Password does not match"
        })
    }

    return res.status(201).json({
        message : "User exists , login successfull" , 
        UserId : existingUser._id
    })
   }

   catch (error) {
    console.error("Error while login" , error)
   }

})

export default authRouter;