import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  image_url: z.string().url().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export const quantitySchema = z.object({
  quantity: z.number().int().positive().optional().default(1),
});
