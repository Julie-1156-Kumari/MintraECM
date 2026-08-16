import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z
    .string({ required_error: 'productId is required' })
    .min(1, 'productId is required'),
  size: z
    .string({ required_error: 'size is required' })
    .trim()
    .min(1, 'size is required'),
  quantity: z.coerce
    .number({ invalid_type_error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1')
    .max(10, 'quantity cannot exceed 10')
    .default(1),
});

export const updateCartItemSchema = z.object({
  productId: z
    .string({ required_error: 'productId is required' })
    .min(1, 'productId is required'),
  size: z
    .string({ required_error: 'size is required' })
    .trim()
    .min(1, 'size is required'),
  quantity: z.coerce
    .number({ invalid_type_error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1')
    .max(10, 'quantity cannot exceed 10'),
});

export const removeCartItemSchema = z.object({
  productId: z
    .string({ required_error: 'productId is required' })
    .min(1, 'productId is required'),
  size: z
    .string({ required_error: 'size is required' })
    .trim()
    .min(1, 'size is required'),
});
