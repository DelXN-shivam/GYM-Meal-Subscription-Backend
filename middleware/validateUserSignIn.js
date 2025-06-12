
import { signInSchema } from "../schema/user.logIn.schema.js";
import { ZodError } from "zod";

/*
  validates user input at /auth/login
*/

export const validateSignIn = (req, res, next) => {
  try {
    const validatedData = signInSchema.parse(req.body);
    req.body = validatedData.data; 
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }
    
    console.error("Validation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};