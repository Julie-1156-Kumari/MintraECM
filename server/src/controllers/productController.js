import asyncHandler from 'express-async-handler';
import * as productService from '../services/productService.js';

/**
 * @desc    Get all products (search, category, brand, price filters)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    product,
  });
});

/**
 * @desc    Get distinct brands
 * @route   GET /api/products/meta/brands
 * @access  Public
 */
export const getProductBrands = asyncHandler(async (req, res) => {
  const brands = await productService.getProductBrands(req.query);

  res.status(200).json({
    success: true,
    brands,
  });
});

/**
 * @desc    Get distinct categories
 * @route   GET /api/products/meta/categories
 * @access  Public
 */
export const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getProductCategories();

  res.status(200).json({
    success: true,
    categories,
  });
});
