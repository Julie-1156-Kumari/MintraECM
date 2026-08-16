import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBrands,
  getProductCategories,
} from '../controllers/productController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  productIdParamsSchema,
  productListQuerySchema,
  productBrandsQuerySchema,
} from '../validators/productValidator.js';

const router = express.Router();

router.get('/', validate(productListQuerySchema, 'query'), getProducts);
router.get(
  '/meta/brands',
  validate(productBrandsQuerySchema, 'query'),
  getProductBrands
);
router.get('/meta/categories', getProductCategories);
router.get('/:id', validate(productIdParamsSchema, 'params'), getProductById);

export default router;
