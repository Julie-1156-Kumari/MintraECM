import { z } from 'zod';

const customerDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,15})$/, 'Phone must be 10–15 digits'),
});

const shippingAddressSchema = z.object({
  flatNo: z.string().trim().min(1, 'Flat/House number is required'),
  area: z.string().trim().min(1, 'Area is required'),
  town: z.string().trim().min(1, 'Town is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.coerce.number().int().min(1).max(10),
  size: z.string().trim().min(1, 'size is required'),
});

export const createOrderSchema = z.object({
  customerDetails: customerDetailsSchema,
  shippingAddress: shippingAddressSchema,
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required'),
  cartId: z.string().optional(),
});

export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export const retryPaymentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});
