import { formatCurrency } from '../utils/formatCurrency';
import {
  FREE_SHIPPING_THRESHOLD,
  getCartTotals,
} from '../utils/cartTotals';

/**
 * Price breakdown: Total MRP, Discount on MRP, Convenience Fee, Total Amount.
 */
export default function PaymentSummary({
  items = [],
  ctaLabel,
  onCta,
  ctaDisabled = false,
  ctaLoading = false,
  ctaFormId,
  showCta = true,
}) {
  const {
    totalMRP,
    discountOnMRP,
    discountedSubtotal,
    convenienceFee,
    totalAmount,
    itemCount,
  } = getCartTotals(items);

  const feeWaived = convenienceFee === 0 && discountedSubtotal > 0;

  return (
    <aside className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">
        Price details ({itemCount} item{itemCount === 1 ? '' : 's'})
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/80">Total MRP</dt>
          <dd className="font-medium text-ink">{formatCurrency(totalMRP)}</dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/80">Discount on MRP</dt>
          <dd className="font-medium text-emerald-600">
            −{formatCurrency(discountOnMRP)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink/80">
            Convenience fee
            {feeWaived && (
              <span className="ml-1.5 text-[11px] font-semibold text-emerald-600">
                FREE
              </span>
            )}
          </dt>
          <dd className="font-medium text-ink">
            {feeWaived ? (
              <span className="text-muted line-through">
                {formatCurrency(99)}
              </span>
            ) : (
              formatCurrency(convenienceFee)
            )}
          </dd>
        </div>

        {!feeWaived && discountedSubtotal > 0 && (
          <p className="rounded-md bg-brand-soft px-3 py-2 text-xs text-brand">
            Add {formatCurrency(FREE_SHIPPING_THRESHOLD - discountedSubtotal)} more
            for free convenience fee.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-dashed border-line pt-3">
          <dt className="text-base font-bold text-ink">Total amount</dt>
          <dd className="text-base font-bold text-ink">
            {formatCurrency(totalAmount)}
          </dd>
        </div>
      </dl>

      {discountOnMRP > 0 && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          You are saving {formatCurrency(discountOnMRP)} on this order
        </p>
      )}

      {showCta && (ctaLabel || ctaFormId) && (
        <button
          type={ctaFormId ? 'submit' : 'button'}
          form={ctaFormId}
          onClick={ctaFormId ? undefined : onCta}
          disabled={ctaDisabled || ctaLoading}
          className="mt-5 flex w-full items-center justify-center rounded-md bg-brand px-4 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted"
        >
          {ctaLoading ? 'Please wait…' : ctaLabel}
        </button>
      )}
    </aside>
  );
}
