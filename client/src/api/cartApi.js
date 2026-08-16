import axiosInstance from './axiosInstance';

const CART_ID_KEY = 'mintraECM_cart_id';

/**
 * Persist guest cart MongoDB _id (acts as session identity; no JWT).
 * @param {string|null} cartId
 */
export const persistCartId = (cartId) => {
  try {
    if (cartId) {
      localStorage.setItem(CART_ID_KEY, String(cartId));
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  } catch (error) {
    console.warn('[cartApi] Failed to persist cart id:', error.message);
  }
};

/**
 * @returns {string|null}
 */
export const getStoredCartId = () => {
  try {
    const id = localStorage.getItem(CART_ID_KEY);
    return id && /^[a-fA-F0-9]{24}$/.test(id) ? id : null;
  } catch (error) {
    console.warn('[cartApi] Failed to read cart id:', error.message);
    return null;
  }
};

/**
 * Create an empty guest cart in MongoDB.
 */
export const createCart = async () => {
  const { data } = await axiosInstance.post('/cart');
  const cart = data.cart;
  if (cart?._id) persistCartId(cart._id);
  return cart;
};

/**
 * Fetch cart by MongoDB id.
 * @param {string} cartId
 */
export const fetchCart = async (cartId) => {
  const { data } = await axiosInstance.get(`/cart/${encodeURIComponent(cartId)}`);
  return data.cart;
};

/**
 * Ensure a guest cart exists; create one if missing or stale.
 * @returns {Promise<string>} cartId
 */
export const ensureCartId = async () => {
  const existing = getStoredCartId();
  if (existing) {
    try {
      await fetchCart(existing);
      return existing;
    } catch (err) {
      if (err.status === 404 || err.status === 400) {
        persistCartId(null);
      } else {
        throw err;
      }
    }
  }
  const cart = await createCart();
  return cart._id;
};

/**
 * Add item to MongoDB cart (server merges same product+size).
 * @param {{ productId: string, size: string, quantity?: number }} payload
 */
export const addCartItem = async (payload) => {
  const cartId = await ensureCartId();
  const { data } = await axiosInstance.post(
    `/cart/${encodeURIComponent(cartId)}/items`,
    payload
  );
  return data.cart;
};

/**
 * Update quantity for product+size in MongoDB cart.
 * @param {{ productId: string, size: string, quantity: number }} payload
 */
export const updateCartItem = async (payload) => {
  const cartId = await ensureCartId();
  const { data } = await axiosInstance.put(
    `/cart/${encodeURIComponent(cartId)}/items`,
    payload
  );
  return data.cart;
};

/**
 * Remove product+size from MongoDB cart.
 * @param {{ productId: string, size: string }} payload
 */
export const removeCartItem = async (payload) => {
  const cartId = await ensureCartId();
  const { data } = await axiosInstance.delete(
    `/cart/${encodeURIComponent(cartId)}/items`,
    {
      data: payload,
      params: payload,
    }
  );
  return data.cart;
};

/**
 * Clear all items from MongoDB cart (keeps cart document).
 */
export const clearRemoteCart = async () => {
  const cartId = getStoredCartId();
  if (!cartId) {
    return { _id: null, items: [], itemCount: 0, totalAmount: 0 };
  }
  const { data } = await axiosInstance.delete(
    `/cart/${encodeURIComponent(cartId)}`
  );
  return data.cart;
};

/**
 * Map API cart document → Redux cart line items.
 * @param {object|null} cart
 */
export const mapCartToItems = (cart) => {
  if (!cart?.items?.length) return [];
  return cart.items.map((item) => {
    const productId = String(item.product?._id || item.product || '');
    return {
      productId,
      name: item.name,
      brand: item.brand,
      image: item.image || '',
      price: Number(item.price) || 0,
      originalPrice: item.originalPrice,
      discountPercent:
        item.originalPrice > item.price
          ? Math.round(
              ((item.originalPrice - item.price) / item.originalPrice) * 100
            )
          : 0,
      size: item.size,
      quantity: item.quantity,
      inStock: true,
    };
  });
};
