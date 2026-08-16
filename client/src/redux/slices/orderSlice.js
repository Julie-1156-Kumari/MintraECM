import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchOrderByTracking } from '../../api/orderApi';

const SHIPPING_STORAGE_KEY = 'mintra_shipping';

const loadShipping = () => {
  try {
    const raw = sessionStorage.getItem(SHIPPING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[orderSlice] Failed to load shipping details:', error.message);
    return null;
  }
};

const persistShipping = (details) => {
  try {
    if (details) {
      sessionStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(details));
    } else {
      sessionStorage.removeItem(SHIPPING_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('[orderSlice] Failed to persist shipping details:', error.message);
  }
};

export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async ({ trackingNumber }, { rejectWithValue, signal }) => {
    try {
      return await fetchOrderByTracking(trackingNumber, signal);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      return rejectWithValue(error.message || 'Failed to track order');
    }
  }
);

const initialState = {
  shippingDetails: loadShipping(),
  activeOrder: null,
  trackingDetails: null,
  trackingLoading: false,
  trackingError: null,
  fromMock: false,
  paymentIntent: null,
  clientSecret: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setShippingDetails(state, action) {
      state.shippingDetails = action.payload;
      persistShipping(action.payload);
    },
    setActiveOrder(state, action) {
      state.activeOrder = action.payload;
    },
    setTrackingDetails(state, action) {
      state.trackingDetails = action.payload;
      state.fromMock = Boolean(action.payload?.fromMock);
      state.trackingError = null;
    },
    clearTracking(state) {
      state.trackingDetails = null;
      state.trackingError = null;
      state.trackingLoading = false;
      state.fromMock = false;
    },
    setPaymentIntent(state, action) {
      state.paymentIntent = action.payload?.paymentIntent ?? action.payload;
      state.clientSecret = action.payload?.clientSecret ?? state.clientSecret;
    },
    clearOrderState(state) {
      state.shippingDetails = null;
      state.activeOrder = null;
      state.trackingDetails = null;
      state.trackingLoading = false;
      state.trackingError = null;
      state.fromMock = false;
      state.paymentIntent = null;
      state.clientSecret = null;
      state.error = null;
      state.loading = false;
      persistShipping(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackOrder.pending, (state, action) => {
        const silent = action.meta.arg?.silent;
        if (!silent) {
          state.trackingLoading = true;
          state.trackingError = null;
        }
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.trackingDetails = action.payload;
        state.fromMock = Boolean(action.payload?.fromMock);
        state.trackingError = null;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.trackingLoading = false;
        if (!action.meta.arg?.silent) {
          state.trackingDetails = null;
        }
        state.trackingError = action.payload || 'Failed to track order';
      });
  },
});

export const {
  setShippingDetails,
  setActiveOrder,
  setTrackingDetails,
  clearTracking,
  setPaymentIntent,
  clearOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;
