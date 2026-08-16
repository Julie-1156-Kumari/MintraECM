import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addCartItem,
  clearRemoteCart,
  fetchCart,
  getStoredCartId,
  mapCartToItems,
  persistCartId,
  removeCartItem,
  updateCartItem,
} from '../../api/cartApi';

/** MongoDB ObjectId hex string (24 chars). Rejects mock-001 etc. */
const isMongoObjectId = (id) =>
  typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

/**
 * Normalize API cart into Redux state shape.
 * @param {object|null} cart
 */
const applyRemoteCart = (state, cart) => {
  if (cart?._id) {
    state.cartId = cart._id;
    persistCartId(cart._id);
  }
  state.items = mapCartToItems(cart);
  state.syncError = null;
  state.hydrated = true;
};

/**
 * Restore cart from MongoDB on app load / refresh.
 * MongoDB is the source of truth; Redux is for instant UI.
 */
export const hydrateCart = createAsyncThunk(
  'cart/hydrateCart',
  async (_, { rejectWithValue }) => {
    try {
      const cartId = getStoredCartId();
      if (!cartId) {
        return { cart: null, empty: true };
      }
      const cart = await fetchCart(cartId);
      return { cart, empty: false };
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        persistCartId(null);
        return { cart: null, empty: true };
      }
      return rejectWithValue(error.message || 'Failed to load cart');
    }
  }
);

/**
 * Optimistic add → POST /api/cart/:cartId/items → replace from MongoDB.
 */
export const addToCartRemote = createAsyncThunk(
  'cart/addToCartRemote',
  async ({ product, size, quantity = 1 }, { rejectWithValue }) => {
    try {
      const productId = String(product?._id || product?.id || '');
      if (!isMongoObjectId(productId)) {
        return rejectWithValue('Invalid product ID');
      }
      const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
      const cart = await addCartItem({
        productId,
        size,
        quantity: qty,
      });
      return { cart, product, size, quantity: qty };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to bag');
    }
  }
);

/**
 * Optimistic qty update → PUT MongoDB cart.
 */
export const updateQuantityRemote = createAsyncThunk(
  'cart/updateQuantityRemote',
  async ({ productId, size, quantity }, { rejectWithValue }) => {
    try {
      const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
      const cart = await updateCartItem({ productId, size, quantity: qty });
      return { cart, productId, size, quantity: qty };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update quantity');
    }
  }
);

/**
 * Optimistic remove → DELETE MongoDB cart item.
 */
export const removeFromCartRemote = createAsyncThunk(
  'cart/removeFromCartRemote',
  async ({ productId, size }, { rejectWithValue }) => {
    try {
      const cart = await removeCartItem({ productId, size });
      return { cart, productId, size };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove item');
    }
  }
);

/**
 * Clear MongoDB cart then Redux (after successful payment).
 */
export const clearCartRemote = createAsyncThunk(
  'cart/clearCartRemote',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await clearRemoteCart();
      return { cart };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

const initialState = {
  cartId: getStoredCartId(),
  items: [],
  hydrated: false,
  syncing: false,
  syncError: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Instant UI add (optimistic). Mongo sync via addToCartRemote.
     */
    addToCart(state, action) {
      const { product, size, quantity = 1 } = action.payload || {};
      if (!product || !size) return;

      const productId = String(product._id || product.id || '');
      if (!isMongoObjectId(productId)) return;

      const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
      const existing = state.items.find(
        (item) => item.productId === productId && item.size === size
      );

      if (existing) {
        existing.quantity = Math.min(10, existing.quantity + qty);
      } else {
        state.items.push({
          productId,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0] || '',
          price: Number(product.price) || 0,
          originalPrice: product.originalPrice,
          discountPercent: product.discountPercent,
          size,
          quantity: qty,
          inStock: product.inStock !== false,
        });
      }
    },
    removeFromCart(state, action) {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === productId && item.size === size)
      );
    },
    updateQuantity(state, action) {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (!item) return;
      item.quantity = Math.max(1, Math.min(10, quantity));
    },
    clearCart(state) {
      state.items = [];
    },
    setCartFromRemote(state, action) {
      applyRemoteCart(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCart.pending, (state) => {
        state.syncing = true;
        state.syncError = null;
      })
      .addCase(hydrateCart.fulfilled, (state, action) => {
        state.syncing = false;
        if (action.payload.empty) {
          state.items = [];
          state.hydrated = true;
          return;
        }
        applyRemoteCart(state, action.payload.cart);
      })
      .addCase(hydrateCart.rejected, (state, action) => {
        state.syncing = false;
        state.hydrated = true;
        state.syncError = action.payload || 'Failed to load cart';
      })
      .addCase(addToCartRemote.fulfilled, (state, action) => {
        applyRemoteCart(state, action.payload.cart);
      })
      .addCase(addToCartRemote.rejected, (state, action) => {
        state.syncError = action.payload || 'Failed to add to bag';
      })
      .addCase(updateQuantityRemote.fulfilled, (state, action) => {
        applyRemoteCart(state, action.payload.cart);
      })
      .addCase(updateQuantityRemote.rejected, (state, action) => {
        state.syncError = action.payload || 'Failed to update quantity';
      })
      .addCase(removeFromCartRemote.fulfilled, (state, action) => {
        applyRemoteCart(state, action.payload.cart);
      })
      .addCase(removeFromCartRemote.rejected, (state, action) => {
        state.syncError = action.payload || 'Failed to remove item';
      })
      .addCase(clearCartRemote.fulfilled, (state, action) => {
        applyRemoteCart(state, action.payload.cart || { items: [] });
      })
      .addCase(clearCartRemote.rejected, (state) => {
        // Still clear local UI after payment even if remote clear failed
        state.items = [];
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartFromRemote,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartId = (state) => state.cart.cartId;

export default cartSlice.reducer;
