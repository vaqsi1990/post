import { z } from 'zod';

// Base registration schema (without confirmPassword)
const registerBaseSchema = z.object({
  email: z.string().email('არასწორი ელფოსტა'),
  password: z.string().min(6, 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
  firstName: z.string().min(1, 'სახელი აუცილებელია').optional(),
  lastName: z.string().min(1, 'გვარი აუცილებელია').optional(),
  phone: z.string().optional(),
  personalIdNumber: z
    .string()
    .min(11, 'პირადობის ნომერი უნდა იყოს 11 ციფრი')
    .max(11, 'პირადობის ნომერი უნდა იყოს 11 ციფრი')
    .regex(/^\d+$/, 'პირადობის ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს'),
});

// Registration schema for frontend (with confirmPassword)
export const registerSchema = registerBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'გაიმეორეთ პაროლი'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'პაროლები არ ემთხვევა',
    path: ['confirmPassword'],
  });

// Registration schema for API (without confirmPassword)
export const registerApiSchema = registerBaseSchema;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('არასწორი ელფოსტა'),
  password: z.string().min(1, 'პაროლი აუცილებელია'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
