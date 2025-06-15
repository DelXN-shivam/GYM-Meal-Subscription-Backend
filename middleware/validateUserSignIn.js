import { signInSchema } from "../schema/user.logIn.schema.js";
import { ZodError } from "zod";

/*
  validates user input at /auth/login
*/

export const validateSignIn = (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
        errors: [{ field: "body", message: "Request body is required" }]
      });
    }

    const validatedData = signInSchema.parse(req.body);
    req.body = validatedData;  // Remove .data since parse() returns the validated data directly
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