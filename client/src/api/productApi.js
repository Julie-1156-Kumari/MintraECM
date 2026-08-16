import axiosInstance from './axiosInstance';
import { mockBrands, mockCategories } from '../assets/mockProducts';

/**
 * Fetch products with optional filters.
 * Returns MongoDB documents with real ObjectIds from the API.
 * @param {Object} params
 * @param {AbortSignal} [signal]
 */
export const fetchProducts = async (params = {}, signal) => {
  try {
    const { data } = await axiosInstance.get('/products', { params, signal });
    if (!Array.isArray(data.products)) {
      // Malformed API payload — do NOT inject mock-* IDs (they break POST /orders)
      return {
        success: false,
        products: [],
        pagination: { page: 1, limit: 0, total: 0, pages: 0 },
        fromMock: false,
      };
    }

    // Always use MongoDB documents from the API (real ObjectIds).
    // Previously an empty DB triggered mockResponse() which replaced _ids with 'mock-001', etc.
    return { ...data, fromMock: false };
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw error;
    }
    // Do not fall back to mockProducts — those IDs are not valid Mongo ObjectIds.
    throw error;
  }
};

/**
 * Fetch a single product by ID (API only — MongoDB ObjectId).
 * @param {string} id
 * @param {AbortSignal} [signal]
 */
export const fetchProductById = async (id, signal) => {
  try {
    const { data } = await axiosInstance.get(`/products/${id}`, { signal });
    return data.product;
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw error;
    }
    // Do not resolve mock-* IDs from mockProducts — they cannot be ordered.
    throw error;
  }
};

/**
 * Distinct categories for filter UI.
 */
export const fetchCategories = async (signal) => {
  try {
    const { data } = await axiosInstance.get('/products/meta/categories', {
      signal,
    });
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      return data.categories;
    }
    return mockCategories;
  } catch (error) {
    console.warn('[productApi] Categories unavailable, using mocks:', error.message);
    return mockCategories;
  }
};

/**
 * Distinct brands for filter UI.
 * @param {Object} [params]
 * @param {AbortSignal} [signal]
 */
export const fetchBrands = async (params = {}, signal) => {
  try {
    const { data } = await axiosInstance.get('/products/meta/brands', {
      params,
      signal,
    });
    if (Array.isArray(data.brands) && data.brands.length > 0) {
      return data.brands;
    }
    return mockBrands;
  } catch (error) {
    console.warn('[productApi] Brands unavailable, using mocks:', error.message);
    return mockBrands;
  }
};
