import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchBrands,
  fetchCategories,
  fetchProductById,
  fetchProducts,
} from '../../api/productApi';

export const getProducts = createAsyncThunk(
  'product/getProducts',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await fetchProducts(params, signal);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      return rejectWithValue(error.message || 'Failed to load products');
    }
  }
);

export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const product = await fetchProductById(id, signal);
      return product;
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      return rejectWithValue(error.message || 'Failed to load product');
    }
  }
);

export const getCategories = createAsyncThunk(
  'product/getCategories',
  async (_, { rejectWithValue, signal }) => {
    try {
      return await fetchCategories(signal);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load categories');
    }
  }
);

export const getBrands = createAsyncThunk(
  'product/getBrands',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await fetchBrands(params, signal);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load brands');
    }
  }
);

const initialState = {
  products: [],
  product: null,
  categories: [],
  brands: [],
  pagination: null,
  filters: {
    search: '',
    category: '',
    brand: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  loading: false,
  detailLoading: false,
  metaLoading: false,
  error: null,
  fromMock: false,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        search: '',
        category: '',
        brand: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
    clearProductError(state) {
      state.error = null;
    },
    clearSelectedProduct(state) {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || null;
        state.fromMock = Boolean(action.payload.fromMock);
      })
      .addCase(getProducts.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.loading = false;
        state.error = action.payload || 'Failed to load products';
      })
      .addCase(getProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load product';
      })
      .addCase(getCategories.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state) => {
        state.metaLoading = false;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearProductError, clearSelectedProduct } =
  productSlice.actions;

export default productSlice.reducer;
