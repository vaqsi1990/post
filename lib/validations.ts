import { z } from 'zod';
import { GEORGIAN_CITY_SET } from './georgianCities';

/** Latin letters (English keyboard / ASCII), spaces, hyphen, apostrophe, period — for names */
const LATIN_NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/;

const MSG_LATIN_NAME =
  'შეიყვანეთ მხოლოდ ლათინური ასოები (ინგლისური კლავიატურა)';
const MSG_GEORGIAN_ADDRESS = 'მისამართი უნდა იყოს ქართული ასოებით';

/** Georgian script block + digits, spaces, common address punctuation */
const GEORGIAN_FIELD_REGEX = /^[\u10A0-\u10FF0-9\s,.\/#\-:()№*–—]+$/u;

/** True if the string contains any Georgian Mkhedruli/Mtavruli letter (used in UI hints). */
export function hasGeorgianLetter(value: string): boolean {
  return /[\u10A0-\u10FF]/.test(value);
}

/** Basic Latin letters A–Z / a–z (used to warn on city/address when Georgian is required). */
export function hasLatinLetter(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

function georgianTextField(emptyMessage: string, formatMessage: string) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .superRefine((val, ctx) => {
      if (!hasGeorgianLetter(val)) {
        ctx.addIssue({ code: 'custom', message: formatMessage });
        return;
      }
      if (!GEORGIAN_FIELD_REGEX.test(val)) {
        ctx.addIssue({ code: 'custom', message: formatMessage });
      }
    });
}

// Base registration schema (without confirmPassword)
const registerBaseSchema = z.object({
  email: z.string().email('არასწორი ელფოსტა'),
  password: z.string().min(6, 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
  firstName: z
    .string()
    .trim()
    .min(1, 'სახელი აუცილებელია')
    .regex(LATIN_NAME_REGEX, MSG_LATIN_NAME),
  lastName: z
    .string()
    .trim()
    .min(1, 'გვარი აუცილებელია')
    .regex(LATIN_NAME_REGEX, MSG_LATIN_NAME),
  phone: z.string().min(9, 'ტელეფონის ნომერი აუცილებელია'),
  otpCode: z.string().length(4, 'კოდი უნდა იყოს 4 ციფრი').regex(/^\d{4}$/, 'მხოლოდ 4 ციფრი'),
  personalIdNumber: z
    .string()
    .min(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .max(11, 'პირადი ნომერი უნდა იყოს 11 ციფრი')
    .regex(/^\d+$/, 'პირადი ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს'),
  city: z
    .string()
    .trim()
    .min(1, 'ქალაქი აუცილებელია')
    .refine((val) => GEORGIAN_CITY_SET.has(val), {
      message: 'აირჩიეთ ქალაქი სიიდან',
    }),
  address: georgianTextField('მისამართი აუცილებელია', MSG_GEORGIAN_ADDRESS),
  termsAccepted: z
    .boolean()
    .refine((value) => value === true, 'გთხოვთ დაეთანხმოთ წესებს და პირობებს'),
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
