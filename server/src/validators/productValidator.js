import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

/** Treat missing / blank query strings as undefined. */
const blankToUndefined = (value) =>
  value === undefined || value === null || value === '' ? undefined : value;

const optionalQueryString = z.preprocess(
  blankToUndefined,
  z.string().trim().optional()
);

const optionalNonNegativeNumber = z.preprocess(
  blankToUndefined,
  z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, 'Cannot be negative')
    .optional()
);

const optionalPage = z.preprocess(
  blankToUndefined,
  z.coerce
    .number({ invalid_type_error: 'page must be a number' })
    .int('page must be an integer')
    .min(1, 'page must be at least 1')
    .optional()
);

const optionalLimit = z.preprocess(
  blankToUndefined,
  z.coerce
    .number({ invalid_type_error: 'limit must be a number' })
    .int('limit must be an integer')
    .min(1, 'limit must be at least 1')
    .max(50, 'limit cannot exceed 50')
    .optional()
);

export const productIdParamsSchema = z.object({
  id: z
    .string({ required_error: 'Product ID is required' })
    .regex(objectIdRegex, 'Invalid product ID'),
});

export const productListQuerySchema = z
  .object({
    search: optionalQueryString,
    category: optionalQueryString,
    brand: optionalQueryString,
    inStock: z
      .enum(['true', 'false'], {
        invalid_type_error: 'inStock must be "true" or "false"',
      })
      .optional(),
    minPrice: optionalNonNegativeNumber,
    maxPrice: optionalNonNegativeNumber,
    page: optionalPage,
    limit: optionalLimit,
    sortBy: z
      .enum(['createdAt', 'price', 'rating', 'name', 'discountPercent'], {
        invalid_type_error: 'Invalid sortBy field',
      })
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] }
  );

export const productBrandsQuerySchema = z.object({
  category: optionalQueryString,
});
