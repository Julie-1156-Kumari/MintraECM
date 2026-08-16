import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ImageOff,
  ShoppingBag,
  Star,
  Zap,
} from 'lucide-react';
import { addToCart, addToCartRemote } from '../redux/slices/cartSlice';
import {
  clearSelectedProduct,
  getProductById,
} from '../redux/slices/productSlice';
import { formatPrice } from '../utils/formatCurrency';

function Gallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const list = images.length > 0 ? images : [null];
  const src = list[active];
  const broken = !src || failed[active];

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface">
        {broken ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
            <ImageOff className="h-12 w-12" aria-hidden />
            <span className="text-sm">Image unavailable</span>
          </div>
        ) : (
          <img
            key={src}
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setFailed((prev) => ({ ...prev, [active]: true }))}
          />
        )}
      </div>
      {list.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {list.map((thumb, i) => (
            <button
              key={`${thumb}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-14 overflow-hidden rounded-md border-2 transition sm:h-20 sm:w-16 ${
                i === active
                  ? 'border-brand'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              {thumb && !failed[i] ? (
                <img
                  src={thumb}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() =>
                    setFailed((prev) => ({ ...prev, [i]: true }))
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface text-muted">
                  <ImageOff className="h-4 w-4" aria-hidden />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, detailLoading, error } = useSelector((state) => state.product);

  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');

  useEffect(() => {
    if (!id) return undefined;
    const promise = dispatch(getProductById(id));
    return () => {
      promise.abort?.();
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    setSelectedSize('');
    setSizeError('');
  }, [id]);

  const productId = product?._id || product?.id;
  const sizes = useMemo(() => product?.sizes || [], [product]);
  const discount = product?.discountPercent || 0;
  const inStock = product?.inStock !== false;

  const requireSize = () => {
    if (!selectedSize) {
      setSizeError('Please select a size');
      toast.error('Please select a size');
      return false;
    }
    setSizeError('');
    return true;
  };

  const handleAddToBag = async () => {
    if (!product || !productId) {
      toast.error('Product unavailable');
      return;
    }
    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }
    if (!requireSize()) return;

    // Instant UI update, then persist to MongoDB cart
    dispatch(
      addToCart({
        product,
        size: selectedSize,
        quantity: 1,
      })
    );
    toast.success('Added to bag');
    try {
      const result = await dispatch(
        addToCartRemote({
          product,
          size: selectedSize,
          quantity: 1,
        })
      );
      if (addToCartRemote.rejected.match(result)) {
        toast.error(result.payload || 'Could not sync bag to server');
      }
    } catch (err) {
      console.error('[ProductDetails] Failed to sync bag:', err);
      toast.error(err.message || 'Could not sync bag to server');
    }
  };

  const handleBuyNow = async () => {
    if (!product || !productId) {
      toast.error('Product unavailable');
      return;
    }
    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }
    if (!requireSize()) return;

    dispatch(
      addToCart({
        product,
        size: selectedSize,
        quantity: 1,
      })
    );
    try {
      const result = await dispatch(
        addToCartRemote({
          product,
          size: selectedSize,
          quantity: 1,
        })
      );
      if (addToCartRemote.rejected.match(result)) {
        toast.error(result.payload || 'Could not sync bag to server');
      }
    } catch (err) {
      console.error('[ProductDetails] Failed to sync bag:', err);
      toast.error(err.message || 'Could not sync bag to server');
    }
    navigate('/cart');
  };

  if (detailLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[3/4] skeleton-shimmer rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton-shimmer rounded" />
            <div className="h-8 w-3/4 skeleton-shimmer rounded" />
            <div className="h-6 w-1/3 skeleton-shimmer rounded" />
            <div className="h-24 w-full skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          {error || 'This item may have been removed or is unavailable.'}
        </p>
        <Link
          to="/"
          className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to catalog
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Gallery images={product.images} name={product.name} />

          <div>
            <p className="text-sm font-bold tracking-wide text-ink uppercase">
              {product.brand}
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-balance text-ink sm:text-3xl">
              {product.name}
            </h1>

            {product.rating > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                {Number(product.rating).toFixed(1)}
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                {product.numReviews > 0 && (
                  <span className="font-medium text-emerald-700/70">
                    ({product.numReviews.toLocaleString('en-IN')} ratings)
                  </span>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold text-ink">
                ₹{formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-muted line-through">
                    MRP ₹{formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-base font-semibold text-orange-600">
                    ({discount}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold tracking-wide text-ink uppercase">
                  Select size
                </h2>
                {!inStock && (
                  <span className="text-xs font-bold tracking-wide text-red-600 uppercase">
                    Out of stock
                  </span>
                )}
              </div>
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Available sizes"
              >
                {sizes.map((size) => {
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!inStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError('');
                      }}
                      className={`min-w-12 rounded-md border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        selected
                          ? 'border-brand bg-brand-soft text-brand'
                          : 'border-line text-ink hover:border-brand'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
                  {sizeError}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand px-5 py-3.5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Add to Bag
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-ink px-5 py-3.5 text-sm font-bold tracking-wide text-ink uppercase transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Zap className="h-4 w-4" aria-hidden />
                Buy Now
              </button>
            </div>

            <div className="mt-10 border-t border-line pt-6">
              <h2 className="text-sm font-bold tracking-wide text-ink uppercase">
                Product details
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">
                {product.description}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Category</dt>
                  <dd className="font-semibold text-ink">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-muted">Brand</dt>
                  <dd className="font-semibold text-ink">{product.brand}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
