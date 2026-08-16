import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import ApiError from '../utils/apiError.js';

/**
 * Build a MongoDB filter from query params (search, category, brand, etc.).
 * @param {Object} query
 * @returns {Object}
 */
const buildProductFilter = (query = {}) => {
  const filter = {};

  const { search, category, brand, inStock, minPrice, maxPrice } = query;

  if (search && String(search).trim()) {
    const term = String(search).trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { brand: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  if (category && String(category).trim()) {
    filter.category = new RegExp(`^${String(category).trim()}$`, 'i');
  }

  if (brand && String(brand).trim()) {
    filter.brand = new RegExp(`^${String(brand).trim()}$`, 'i');
  }

  if (inStock !== undefined && inStock !== '') {
    filter.inStock = String(inStock).toLowerCase() === 'true';
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.price.$lte = Number(maxPrice);
    }
  }

  return filter;
};

/**
 * Fetch products with optional filters and pagination.
 * @param {Object} query - Express req.query
 */
export const getProducts = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'price', 'rating', 'name', 'discountPercent'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const filter = buildProductFilter(query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 0,
    },
  };
};

/**
 * Fetch a single product by MongoDB ObjectId.
 * @param {string} id
 */
export const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id).lean();

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  return product;
};

/**
 * Distinct brands (optionally scoped by category) for filter UI.
 * @param {Object} query
 */
export const getProductBrands = async (query = {}) => {
  const filter = {};
  if (query.category && String(query.category).trim()) {
    filter.category = new RegExp(`^${String(query.category).trim()}$`, 'i');
  }
  const brands = await Product.distinct('brand', filter);
  return brands.sort((a, b) => a.localeCompare(b));
};

/**
 * Distinct categories for filter UI.
 */
export const getProductCategories = async () => {
  const categories = await Product.distinct('category');
  return categories.sort((a, b) => a.localeCompare(b));
};
