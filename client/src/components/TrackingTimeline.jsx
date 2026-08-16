import {
  Check,
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  Warehouse,
} from 'lucide-react';

export const TRACKING_STEPS = [
  {
    status: 'ORDERED',
    label: 'Ordered',
    description: 'We received your order and payment is confirmed.',
    icon: Package,
  },
  {
    status: 'PACKED',
    label: 'Packed',
    description: 'Your items are packed and ready to leave the warehouse.',
    icon: Warehouse,
  },
  {
    status: 'SHIPPED',
    label: 'Shipped',
    description: 'The package has been handed to the courier partner.',
    icon: Truck,
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for delivery',
    description: 'Your package is out for delivery today.',
    icon: PackageCheck,
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    description: 'Package delivered successfully. Enjoy your order!',
    icon: CheckCircle2,
  },
];

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Visual step timeline: ORDERED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
 */
export default function TrackingTimeline({
  currentStatus = 'ORDERED',
  statusHistory = [],
}) {
  const currentIndex = Math.max(
    0,
    TRACKING_STEPS.findIndex((step) => step.status === currentStatus)
  );
  const isDelivered = currentStatus === 'DELIVERED';

  const historyByStatus = (statusHistory || []).reduce((acc, entry) => {
    if (entry?.status && !acc[entry.status]) {
      acc[entry.status] = entry;
    }
    return acc;
  }, {});

  return (
    <ol className="relative space-y-0" aria-label="Order progress">
      {TRACKING_STEPS.map((step, index) => {
        const Icon = step.icon;
        const done = index < currentIndex || isDelivered;
        const active = index === currentIndex && !isDelivered;
        const upcoming = index > currentIndex;
        const history = historyByStatus[step.status];
        const timestamp = formatTimestamp(history?.timestamp);
        const isLast = index === TRACKING_STEPS.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute top-10 left-5 h-[calc(100%-1.25rem)] w-0.5 -translate-x-1/2 ${
                  done || active ? 'bg-brand' : 'bg-line'
                }`}
                aria-hidden
              />
            )}

            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                done
                  ? 'border-brand bg-brand text-white'
                  : active
                    ? 'border-brand bg-brand-soft text-brand tracking-pulse'
                    : 'border-line bg-white text-muted'
              }`}
            >
              {done ? (
                <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              ) : (
                <Icon className="h-5 w-5" aria-hidden />
              )}
            </span>

            <div className={`min-w-0 flex-1 pt-1 ${upcoming ? 'opacity-55' : ''}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={`font-display text-base font-semibold ${
                    active || done ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {step.label}
                </p>
                {active && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                    Current
                  </span>
                )}
                {done && index === currentIndex && isDelivered && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                    Complete
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
              {timestamp && (
                <p className="mt-1.5 text-xs font-medium text-ink/60">
                  {timestamp}
                  {history?.note ? ` · ${history.note}` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
