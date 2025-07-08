import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string().min(1, 'fullName is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  dateOfBirth: z.coerce.date({ invalid_type_error: 'Invalid date' }),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
