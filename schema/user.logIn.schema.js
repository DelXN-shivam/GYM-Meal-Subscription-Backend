import { z } from "zod";

/*
  defines the user schema for /auth/login
  exports the schema to validateUserSignIn.js middleware
*/

export const signInSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  password: z.string().min(1).transform(val => val.trim()), // Fixed: z.string().min(1)
});