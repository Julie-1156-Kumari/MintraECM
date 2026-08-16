import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Star } from 'lucide-react';
import { formatPrice } from '../utils/formatCurrency';

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  const src = product.images?.[0];

  if (!src || failed) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-surface text-muted">
        <ImageOff className="h-10 w-10" aria-hidden />
        <span className="sr-only">No product image</span>
      </div>
    );
  }

  return (
    <div className="aspect-[3/4] overflow-hidden bg-surface">
      <img
        src={src}
        alt={product.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function ProductCard({ product }) {
  const id = product._id || product.id;
  const discount = product.discountPercent || 0;
  const sizes = (product.sizes || []).slice(0, 4);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_12px_28px_-12px_rgba(255,63,108,0.35)]">
      <Link to={`/product/${id}`} className="relative block overflow-hidden">
        <ProductImage product={product} />
        {!product.inStock && (
          <span className="absolute top-3 left-3 rounded bg-ink/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
            Sold out
          </span>
        )}
        {discount > 0 && product.inStock && (
          <span className="absolute top-3 right-3 rounded bg-brand px-2 py-1 text-[10px] font-bold tracking-wide text-white">
            {discount}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold tracking-wide text-ink uppercase">
            {product.brand}
          </p>
          {product.rating > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {Number(product.rating).toFixed(1)}
              <Star className="h-3 w-3 fill-current" aria-hidden />
            </span>
          )}
        </div>

        <Link
          to={`/product/${id}`}
          className="line-clamp-2 text-sm leading-snug text-muted transition group-hover:text-ink"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-ink">
            ₹{formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xs text-muted line-through">
                ₹{formatPrice(product.originalPrice)}
              </span>
              <span className="text-xs font-semibold text-orange-600">
                ({discount}% OFF)
              </span>
            </>
          )}
        </div>

        {sizes.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-muted"
              >
                {size}
              </span>
            ))}
            {(product.sizes || []).length > 4 && (
              <span className="px-1 text-[10px] text-muted">+</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
