import { useState } from 'react';
import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import {
  removeFromCart,
  removeFromCartRemote,
  updateQuantity,
  updateQuantityRemote,
} from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/formatCurrency';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const [imgFailed, setImgFailed] = useState(false);

  const onQty = (next) => {
    // Optimistic UI, then sync MongoDB
    dispatch(
      updateQuantity({
        productId: item.productId,
        size: item.size,
        quantity: next,
      })
    );
    dispatch(
      updateQuantityRemote({
        productId: item.productId,
        size: item.size,
        quantity: next,
      })
    );
  };

  const onRemove = () => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        size: item.size,
      })
    );
    dispatch(
      removeFromCartRemote({
        productId: item.productId,
        size: item.size,
      })
    );
  };

  return (
    <article className="flex gap-3 border-b border-line py-5 last:border-b-0 sm:gap-4">
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-surface sm:h-32 sm:w-24">
        {item.image && !imgFailed ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-ink uppercase">
              {item.brand}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-sm text-ink/85">{item.name}</h3>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-brand"
            aria-label={`Remove ${item.name} from bag`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted">
          Size:{' '}
          <span className="font-semibold text-ink">{item.size}</span>
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-ink">
            ₹{formatPrice(item.price)}
          </span>
          {item.originalPrice > item.price && (
            <>
              <span className="text-xs text-muted line-through">
                ₹{formatPrice(item.originalPrice)}
              </span>
              {item.discountPercent > 0 && (
                <span className="text-xs font-semibold text-orange-600">
                  ({item.discountPercent}% OFF)
                </span>
              )}
            </>
          )}
        </div>

        <div className="mt-3 inline-flex items-center rounded-md border border-line">
          <button
            type="button"
            onClick={() => onQty(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="inline-flex h-8 w-8 items-center justify-center text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:text-muted"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span
            className="min-w-8 text-center text-sm font-semibold text-ink"
            aria-live="polite"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQty(item.quantity + 1)}
            disabled={item.quantity >= 10}
            className="inline-flex h-8 w-8 items-center justify-center text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:text-muted"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
