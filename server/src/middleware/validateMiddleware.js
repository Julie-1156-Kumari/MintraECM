import { ZodError } from 'zod';
import ApiError from '../utils/apiError.js';

/**
 * Express middleware factory that validates req.body / query / params with a Zod schema.
 * @param { import('zod').ZodSchema } schema
 * @param {'body'|'query'|'params'} [source='body']
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    next(error);
  }
};

export default validate;
