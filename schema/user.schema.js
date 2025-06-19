import { z } from "zod";

/*
  user schema for /register
  defines the userSchema and export to the validateUserInput.js middleware
*/

export const userSchema = z.object({
  name: z.string().min(1).transform(val => val.trim()),
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  password: z.string().min(1).transform(val => val.trim()),
  contactNo: z.string().regex(/^[0-9]{10}$/).transform(val => val.trim())
});

