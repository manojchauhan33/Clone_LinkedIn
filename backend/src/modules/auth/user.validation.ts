import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().nonempty("Name is required field"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be 6 characters"),
});


export type SignupInput = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z.object({
  // token: z.string().nonempty("Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});