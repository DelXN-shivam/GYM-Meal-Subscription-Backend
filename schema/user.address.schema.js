import { z } from "zod";



export const addressSchema = z.object({
  defaultAddress: z.string().transform(val => val.trim().toLowerCase()).default("home"),
  actualAddress : z.string().transform(val => val.trim().toLowerCase()),
  deliveryDate: z.preprocess(val => new Date(val), z.date()),
  customAddress: z.string().transform(val => val.trim().toLowerCase()).optional(), 
});