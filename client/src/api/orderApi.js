import axiosInstance from './axiosInstance';

const ORDER_STATUSES = [
  'ORDERED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/**
 * Demo order for offline / empty-API previews.
 * Use tracking number: MYN-TRK-DEMO01
 */
export const buildDemoOrder = (trackingNumber = 'MYN-TRK-DEMO01') => {
  const normalized = String(trackingNumber).trim().toUpperCase();
  const now = Date.now();
  const hours = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

  return {
    _id: 'demo-order-001',
    trackingNumber: normalized || 'MYN-TRK-DEMO01',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    totalAmount: 3298,
    customerDetails: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
    },
    shippingAddress: {
      flatNo: 'A-12',
      area: 'MG Road',
      town: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
    },
    items: [
      {
        product: 'mock-001',
        name: 'Men Slim Fit Casual Shirt',
        brand: 'Roadster',
        image:
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
        quantity: 1,
        size: 'M',
        price: 799,
      },
      {
        product: 'mock-003',
        name: 'Unisex Classic Leather Sneakers',
        brand: 'Puma',
        image:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
        quantity: 1,
        size: '9',
        price: 2499,
      },
    ],
    statusHistory: [
      { status: 'ORDERED', timestamp: hours(36), note: 'Order placed' },
      { status: 'PACKED', timestamp: hours(28), note: 'Packed at warehouse' },
      { status: 'SHIPPED', timestamp: hours(18), note: 'Handed to courier' },
    ],
    createdAt: hours(36),
    updatedAt: hours(18),
    fromMock: true,
  };
};

const isDemoTracking = (trackingNumber) => {
  const value = String(trackingNumber || '')
    .trim()
    .toUpperCase();
  return value === 'MYN-TRK-DEMO01' || value === 'DEMO' || value === 'DEMO01';
};

/**
 * Normalize user input to MYN-TRK-XXXXXX when possible.
 * @param {string} value
 */
export const normalizeTrackingNumber = (value = '') => {
  const raw = String(value).trim().toUpperCase().replace(/\s+/g, '');
  if (!raw) return '';
  if (raw === 'DEMO' || raw === 'DEMO01') return 'MYN-TRK-DEMO01';
  if (raw.startsWith('MYN-TRK-')) return raw;
  if (/^[A-F0-9]{6}$/i.test(raw)) return `MYN-TRK-${raw}`;
  return raw;
};

/**
 * Fetch order by tracking number.
 * Falls back to the demo order for MYN-TRK-DEMO01 when the API is unreachable.
 * @param {string} trackingNumber
 * @param {AbortSignal} [signal]
 */
export const fetchOrderByTracking = async (trackingNumber, signal) => {
  const code = normalizeTrackingNumber(trackingNumber);

  if (!code) {
    const error = new Error('Enter a tracking number');
    error.status = 400;
    throw error;
  }

  try {
    const { data } = await axiosInstance.get(
      `/orders/track/${encodeURIComponent(code)}`,
      { signal }
    );
    return { ...data.order, fromMock: false };
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw error;
    }

    // Explicit demo code always works offline
    if (isDemoTracking(code)) {
      return buildDemoOrder(code);
    }

    // Network / server down — surface a clear error (not a fake 404)
    if (!error.status || error.status >= 500) {
      const offline = new Error(
        'Unable to reach the server. Try again, or use MYN-TRK-DEMO01 for a demo.'
      );
      offline.status = error.status || 503;
      throw offline;
    }

    const notFound = new Error(
      error.message || 'Order not found for this tracking number'
    );
    notFound.status = error.status || 404;
    throw notFound;
  }
};

export { ORDER_STATUSES };
