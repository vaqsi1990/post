import { z } from 'zod';

// Base registration schema (without confirmPassword)
const registerBaseSchema = z.object({
  email: z.string().email('არასწორი ელფოსტა'),
  password: z.string().min(6, 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
  firstName: z.string().min(1, 'სახელი აუცილებელია').optional(),
  lastName: z.string().min(1, 'გვარი აუცილებელია').optional(),
  phone: z.string().min(9, 'ტელეფონის ნომერი აუცილებელია'),
  otpCode: z.string().length(4, 'კოდი უნდა იყოს 4 ციფრი').regex(/^\d{4}$/, 'მხოლოდ 4 ციფრი'),
  personalIdNumber: z
    .string()
    .min(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .max(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .regex(/^\d+$/, 'პირადი ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს'),
  city: z.string().min(1, 'ქალაქი აუცილებელია'),
  address: z.string().min(1, 'მისამართი აუცილებელია'),
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

// Admin: create user manually (no OTP)
export const adminCreateUserSchema = z.object({
  email: z.string().email('არასწორი ელფოსტა'),
  password: z.string().min(6, 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
  firstName: z.string().min(1, 'სახელი აუცილებელია').optional(),
  lastName: z.string().min(1, 'გვარი აუცილებელია').optional(),
  phone: z.string().min(9, 'მინიმუმ 9 ციფრი').optional().or(z.literal('')),
  personalIdNumber: z
    .string()
    .min(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .max(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .regex(/^\d+$/, 'პირადი ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს'),
  city: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
