import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function Success() {
  const { state } = useLocation();
  const trackingNumber = state?.trackingNumber;
  const amount = state?.amount;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="font-display mt-5 text-2xl font-bold text-ink">
        Payment successful
      </h1>
      <p className="mt-2 text-sm text-muted">
        Your order is confirmed
        {amount != null ? ` for ${formatCurrency(amount)}` : ''}.
      </p>
      {trackingNumber && (
        <p className="mt-4 rounded-md bg-surface px-4 py-3 font-mono text-sm font-semibold text-ink">
          {trackingNumber}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {trackingNumber ? (
          <Link
            to={`/tracking/${encodeURIComponent(trackingNumber)}`}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            <Package className="h-4 w-4" aria-hidden />
            Track order
          </Link>
        ) : (
          <Link
            to="/tracking"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Track order
          </Link>
        )}
        <Link
          to="/"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-bold text-ink hover:border-brand hover:text-brand"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
