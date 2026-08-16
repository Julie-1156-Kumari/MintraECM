import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageOpen,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import {
  clearFilters,
  getBrands,
  getCategories,
  getProducts,
  setFilters,
} from '../redux/slices/productSlice';

const BANNERS = [
  {
    id: 1,
    eyebrow: 'Summer edit',
    title: 'Fresh fits for every day',
    subtitle: 'Up to 50% off on apparel essentials',
    cta: 'Shop Apparel',
    to: '/?category=Apparel',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    tone: 'from-rose-950/70 via-rose-900/35 to-transparent',
  },
  {
    id: 2,
    eyebrow: 'Step up',
    title: 'Sneakers that move with you',
    subtitle: 'Top kicks from Nike, Puma & more',
    cta: 'Shop Shoes',
    to: '/?category=Shoes',
    image:
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&q=80',
    tone: 'from-slate-950/75 via-slate-900/40 to-transparent',
  },
  {
    id: 3,
    eyebrow: 'Finish the look',
    title: 'Bags, watches & shades',
    subtitle: 'Accessories that complete every outfit',
    cta: 'Shop Accessories',
    to: '/?category=Accessories',
    image:
      'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1600&q=80',
    tone: 'from-ink/80 via-ink/40 to-transparent',
  },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'discountPercent:desc', label: 'Best Discount' },
  { value: 'rating:desc', label: 'Top Rated' },
];

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="aspect-[3/4] skeleton-shimmer" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 skeleton-shimmer rounded" />
        <div className="h-4 w-4/5 skeleton-shimmer rounded" />
        <div className="h-4 w-1/2 skeleton-shimmer rounded" />
      </div>
    </div>
  );
}

function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir) => {
    setIndex((i) => (i + dir + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => go(1), 5500);
    return () => clearInterval(id);
  }, [paused, go]);

  const banner = BANNERS[index];

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
        <img
          key={banner.id}
          src={banner.image}
          alt=""
          className="banner-enter absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${banner.tone}`}
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[280px] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[360px] sm:px-6 sm:py-14 lg:min-h-[420px] lg:justify-center">
          <p
            key={`eye-${banner.id}`}
            className="banner-enter text-xs font-bold tracking-[0.2em] text-white/80 uppercase"
          >
            {banner.eyebrow}
          </p>
          <h1
            key={`title-${banner.id}`}
            className="banner-enter font-display mt-2 max-w-xl text-3xl font-bold text-balance text-white sm:text-4xl lg:text-5xl"
            style={{ animationDelay: '60ms' }}
          >
            {banner.title}
          </h1>
          <p
            key={`sub-${banner.id}`}
            className="banner-enter mt-3 max-w-md text-sm text-white/85 sm:text-base"
            style={{ animationDelay: '120ms' }}
          >
            {banner.subtitle}
          </p>
          <Link
            key={`cta-${banner.id}`}
            to={banner.to}
            className="banner-enter mt-6 inline-flex w-fit items-center rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            style={{ animationDelay: '180ms' }}
          >
            {banner.cta}
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-md transition hover:bg-white sm:inline-flex"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-md transition hover:bg-white sm:inline-flex"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-brand' : 'w-2 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function FilterPanel({
  categories,
  brands,
  category,
  brand,
  onCategory,
  onBrand,
  onClear,
  hasActiveFilters,
}) {
  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink uppercase">
          <Filter className="h-4 w-4 text-brand" aria-hidden />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-xs font-bold tracking-wide text-muted uppercase">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onCategory('')}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                !category
                  ? 'bg-brand-soft font-semibold text-brand'
                  : 'text-ink/80 hover:bg-surface'
              }`}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => onCategory(cat)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  category === cat
                    ? 'bg-brand-soft font-semibold text-brand'
                    : 'text-ink/80 hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-bold tracking-wide text-muted uppercase">
          Brand
        </p>
        <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
          <li>
            <button
              type="button"
              onClick={() => onBrand('')}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                !brand
                  ? 'bg-brand-soft font-semibold text-brand'
                  : 'text-ink/80 hover:bg-surface'
              }`}
            >
              All brands
            </button>
          </li>
          {brands.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => onBrand(b)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  brand === b
                    ? 'bg-brand-soft font-semibold text-brand'
                    : 'text-ink/80 hover:bg-surface'
                }`}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { products, categories, brands, loading, error, fromMock, pagination } =
    useSelector((state) => state.product);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const sortParam = searchParams.get('sort') || 'createdAt:desc';

  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = sortParam.split(':');
    return [field || 'createdAt', order || 'desc'];
  }, [sortParam]);

  const hasActiveFilters = Boolean(search || category || brand);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearAllFilters = () => {
    dispatch(clearFilters());
    setSearchParams({}, { replace: true });
    setMobileFiltersOpen(false);
  };

  useEffect(() => {
    dispatch(setFilters({ search, category, brand, sortBy, sortOrder }));
  }, [dispatch, search, category, brand, sortBy, sortOrder]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBrands(category ? { category } : {}));
  }, [dispatch, category]);

  useEffect(() => {
    const promise = dispatch(
      getProducts({
        search: search || undefined,
        category: category || undefined,
        brand: brand || undefined,
        sortBy,
        sortOrder,
        limit: 24,
      })
    );
    return () => {
      promise.abort?.();
    };
  }, [dispatch, search, category, brand, sortBy, sortOrder]);

  const resultLabel = useMemo(() => {
    const total = pagination?.total ?? products.length;
    if (search) return `${total} result${total === 1 ? '' : 's'} for “${search}”`;
    if (category || brand) {
      const bits = [category, brand].filter(Boolean).join(' · ');
      return `${total} item${total === 1 ? '' : 's'} · ${bits}`;
    }
    return `${total} product${total === 1 ? '' : 's'}`;
  }, [pagination, products.length, search, category, brand]);

  const filterProps = {
    categories,
    brands,
    category,
    brand,
    onCategory: (value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set('category', value);
          else next.delete('category');
          next.delete('brand');
          return next;
        },
        { replace: true }
      );
      setMobileFiltersOpen(false);
    },
    onBrand: (value) => {
      updateParam('brand', value);
      setMobileFiltersOpen(false);
    },
    onClear: clearAllFilters,
    hasActiveFilters,
  };

  return (
    <div className="bg-white">
      <BannerCarousel />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
              Catalog
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
              Shop the collection
            </h2>
            <p className="mt-1 text-sm text-muted">{resultLabel}</p>
            {fromMock && (
              <p className="mt-1 text-xs text-amber-700">
                Showing demo catalog (API offline or empty database).
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
            </button>

            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-line bg-white p-4">
              <FilterPanel {...filterProps} />
            </div>
          </div>

          <div>
            {error && (
              <div
                className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {loading && (
              <ul
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                aria-busy="true"
                aria-label="Loading products"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <ProductSkeleton />
                  </li>
                ))}
              </ul>
            )}

            {!loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/60 px-6 py-20 text-center">
                <PackageOpen className="mb-3 h-10 w-10 text-muted" aria-hidden />
                <p className="font-display text-lg font-semibold text-ink">
                  No products found
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Try another search, category, or brand — or clear filters to browse everything.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && products.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <li key={product._id || product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,320px)] overflow-y-auto bg-white p-5 shadow-xl">
            <FilterPanel {...filterProps} />
          </div>
        </div>
      )}
    </div>
  );
}
