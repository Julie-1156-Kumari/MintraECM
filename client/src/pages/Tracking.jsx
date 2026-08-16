import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  ImageOff,
  MapPin,
  PackageSearch,
  RefreshCw,
  Search,
} from 'lucide-react';
import TrackingTimeline from '../components/TrackingTimeline';
import {
  clearTracking,
  trackOrder,
} from '../redux/slices/orderSlice';
import {
  normalizeTrackingNumber,
} from '../api/orderApi';
import { formatCurrency, formatPrice } from '../utils/formatCurrency';

const POLL_INTERVAL_MS = 20000;

function paymentBadgeClass(status) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 ring-red-200';
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-200';
  }
}

function formatAddress(address) {
  if (!address) return '';
  return [
    address.flatNo,
    address.area,
    address.town,
    `${address.city}, ${address.state} ${address.pinCode}`,
  ]
    .filter(Boolean)
    .join(', ');
}

export default function Tracking() {
  const { trackingNumber: routeTracking } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { trackingDetails, trackingLoading, trackingError, fromMock } =
    useSelector((state) => state.order);

  const [inputValue, setInputValue] = useState(
    normalizeTrackingNumber(routeTracking || '')
  );

  const activeCode = useMemo(
    () => normalizeTrackingNumber(routeTracking || ''),
    [routeTracking]
  );

  const loadOrder = useCallback(
    (code, { silent } = {}) => {
      const normalized = normalizeTrackingNumber(code);
      if (!normalized) return;
      dispatch(trackOrder({ trackingNumber: normalized, silent }));
    },
    [dispatch]
  );

  useEffect(() => {
    setInputValue(activeCode);
    if (activeCode) {
      loadOrder(activeCode);
    } else {
      dispatch(clearTracking());
    }
  }, [activeCode, loadOrder, dispatch]);

  // Soft polling for in-progress shipments
  useEffect(() => {
    if (!activeCode || !trackingDetails) return undefined;
    if (trackingDetails.orderStatus === 'DELIVERED') return undefined;
    if (trackingDetails.paymentStatus === 'FAILED') return undefined;

    const id = setInterval(() => {
      loadOrder(activeCode, { silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [activeCode, trackingDetails, loadOrder]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = normalizeTrackingNumber(inputValue);
    if (!code) return;
    if (code === activeCode) {
      loadOrder(code);
      return;
    }
    navigate(`/tracking/${encodeURIComponent(code)}`);
  };

  const handleDemo = () => {
    navigate('/tracking/MYN-TRK-DEMO01');
  };

  const order = trackingDetails;
  const showResults = Boolean(activeCode);

  return (
    <div className="bg-surface/40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-8">
          <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
            Order tracking
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
            Track your shipment
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Enter your tracking number (format{' '}
            <span className="font-semibold text-ink">MYN-TRK-XXXXXX</span>) to
            see live delivery progress.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-line bg-white p-4 shadow-sm sm:p-5"
          role="search"
        >
          <label htmlFor="tracking-input" className="text-sm font-semibold text-ink">
            Tracking number
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                id="tracking-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                placeholder="MYN-TRK-XXXXXX"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border border-line bg-white py-3 pr-3 pl-10 font-mono text-sm tracking-wide text-ink outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button
              type="submit"
              disabled={trackingLoading && !order}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white uppercase transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted"
            >
              {trackingLoading && !order ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                  Tracking…
                </>
              ) : (
                <>
                  <PackageSearch className="h-4 w-4" aria-hidden />
                  Track
                </>
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <button
              type="button"
              onClick={handleDemo}
              className="font-semibold text-brand hover:text-brand-dark"
            >
              Try demo: MYN-TRK-DEMO01
            </button>
            {order && activeCode && (
              <button
                type="button"
                onClick={() => loadOrder(activeCode)}
                className="inline-flex items-center gap-1 font-semibold text-ink/70 hover:text-brand"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${trackingLoading ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                Refresh status
              </button>
            )}
          </div>
        </form>

        {showResults && trackingLoading && !order && (
          <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading tracking">
            <div className="h-40 rounded-xl skeleton-shimmer" />
            <div className="h-64 rounded-xl skeleton-shimmer" />
          </div>
        )}

        {showResults && trackingError && !order && !trackingLoading && (
          <div
            className="mt-8 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Couldn’t find this order</p>
              <p className="mt-1 text-red-700/90">{trackingError}</p>
            </div>
          </div>
        )}

        {order && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="text-xs font-bold tracking-wide text-muted uppercase">
                    Tracking ID
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold tracking-wide text-ink">
                    {order.trackingNumber}
                  </p>
                  {fromMock && (
                    <p className="mt-1 text-xs text-amber-700">
                      Demo shipment preview
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ring-1 ring-inset ${paymentBadgeClass(order.paymentStatus)}`}
                >
                  Payment {order.paymentStatus || 'PENDING'}
                </span>
              </div>

              <div className="mt-6">
                <h2 className="mb-5 font-display text-lg font-semibold text-ink">
                  Delivery progress
                </h2>
                <TrackingTimeline
                  currentStatus={order.orderStatus || 'ORDERED'}
                  statusHistory={order.statusHistory || []}
                />
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                  <MapPin className="h-5 w-5 text-brand" aria-hidden />
                  Delivery address
                </h2>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {order.customerDetails?.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {formatAddress(order.shippingAddress)}
                </p>
                {order.customerDetails?.phone && (
                  <p className="mt-2 text-sm text-muted">
                    Phone:{' '}
                    <span className="font-medium text-ink">
                      {order.customerDetails.phone}
                    </span>
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Items
                  </h2>
                  <p className="text-sm font-bold text-ink">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <ul className="mt-4 divide-y divide-line">
                  {(order.items || []).map((item, index) => (
                    <li
                      key={`${item.product || item.name}-${item.size}-${index}`}
                      className="flex gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted">
                            <ImageOff className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold tracking-wide text-ink uppercase">
                          {item.brand}
                        </p>
                        <p className="line-clamp-2 text-sm text-ink/80">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Size {item.size} · Qty {item.quantity} · ₹
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <Link
                to="/"
                className="inline-flex w-full items-center justify-center rounded-md border border-line bg-white px-4 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}

        {!showResults && (
          <div className="mt-10 rounded-xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-muted" aria-hidden />
            <p className="mt-3 font-display text-lg font-semibold text-ink">
              Ready when you are
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Paste a tracking number above, or try the demo shipment to preview
              the timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
