import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(500, 'Product name must be less than 500 characters'),
  category: z.string()
    .min(1, 'Category is required'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000000, 'Price must be less than 10,000,000'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(1000000, 'Stock must be less than 1,000,000'),
  description: z.string()
    .max(5000, 'Description must be less than 5,000 characters')
    .optional()
    .nullable(),
  images: z.array(z.string().url('Invalid image URL')).optional().default([]),
  videos: z.array(z.string().url('Invalid video URL')).optional().default([]),
  featured: z.boolean().default(false),
  is_highlight: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Admin login validation schema (username based)
export const adminLoginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(64, 'Username must be less than 64 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, dashes and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be less than 72 characters'),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;


// Phone validation
export const phoneSchema = z.object({
  phone: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^\+?[0-9]+$/, 'Please enter a valid phone number'),
});

// OTP validation
export const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

// Display name validation
export const displayNameSchema = z.object({
  displayName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
});

// Validate function helper
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
};
