import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1).transform(val => val.trim()),
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  password: z.string().min(1).transform(val => val.trim()),
  height: z.number().min(1),
  weight: z.number().min(1),
  gender: z.enum(["Male", "Female", "Other"]),
  contactNo: z.string().regex(/^[0-9]{10}$/).transform(val => val.trim()),
  homeAddress: z.string().transform(val => val.trim()).optional(),
  officeAddress: z.string().transform(val => val.trim()).optional(),
  collegeAddress: z.string().transform(val => val.trim()).optional(),
  fitnessGoal: z.string().transform(val => val.trim().toLowerCase()).default("muscle-gain"),
  dietPreference: z.string().transform(val => val.trim().toLowerCase()).default("veg"),
  allergy: z.string().transform(val => val.trim().toLowerCase()).optional().default("none"),
  activityLevel: z.string().transform(val => val.trim().toLowerCase()).default("active"),
});

