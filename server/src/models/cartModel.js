import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: true,
      min: [0, 'Original price cannot be negative'],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    // Guest session identity (no JWT). Defaults to cart _id string after create.
    sessionId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Alias required by cart contract (same as itemCount)
cartSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.virtual('totalMRP').get(function () {
  return this.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
});

cartSchema.methods.findItemIndex = function (productId, size) {
  return this.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      item.size.toLowerCase() === String(size).toLowerCase()
  );
};

// Ensure every guest cart has a sessionId for lookup without JWT
cartSchema.pre('save', function (next) {
  if (!this.sessionId && this._id) {
    this.sessionId = this._id.toString();
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
