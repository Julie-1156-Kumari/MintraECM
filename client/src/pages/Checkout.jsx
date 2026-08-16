import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft, ImageOff, ShoppingBag } from 'lucide-react';
import AddressForm from '../components/AddressForm';
import PaymentSummary from '../components/PaymentSummary';
import { selectCartItems } from '../redux/slices/cartSlice';
import { setShippingDetails } from '../redux/slices/orderSlice';
import { formatCurrency, formatPrice } from '../utils/formatCurrency';

const FORM_ID = 'checkout-address-form';

function OrderItemRow({ item }) {
  return (
    <li className="flex gap-3 border-b border-line py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface sm:h-24 sm:w-20">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-wide text-ink uppercase">
          {item.brand}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink/80">{item.name}</p>
        <p className="mt-1.5 text-xs text-muted">
          Size: <span className="font-semibold text-ink">{item.size}</span>
          <span className="mx-1.5 text-line">|</span>
          Qty: <span className="font-semibold text-ink">{item.quantity}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-ink">
            ₹{formatPrice(item.price)}
          </span>
          {item.originalPrice > item.price && (
            <span className="text-xs text-muted line-through">
              ₹{formatPrice(item.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const shippingDetails = useSelector((state) => state.order.shippingDetails);

  const handleAddressSubmit = (payload) => {
    if (items.length === 0) {
      toast.error('Your bag is empty');
      navigate('/cart');
      return;
    }

    dispatch(setShippingDetails(payload));
    toast.success('Address saved');
    navigate('/payment');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ShoppingBag className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="font-display mt-5 text-2xl font-bold text-ink">
          Your bag is empty
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add items to your bag before checking out.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
              Checkout
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
              Shipping & contact
            </h1>
            <p className="mt-1 text-sm text-muted">
              Guest checkout — no account required. Total{' '}
              <span className="font-semibold text-ink">
                {formatCurrency(
                  items.reduce((s, i) => s + i.price * i.quantity, 0)
                )}
              </span>{' '}
              · {items.reduce((s, i) => s + i.quantity, 0)} item
              {items.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'}
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 transition hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to bag
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <AddressForm
              formId={FORM_ID}
              defaultShipping={shippingDetails}
              onSubmit={handleAddressSubmit}
              submitLabel="Continue to payment"
              showSubmitButton
            />

            <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Order items
                </h2>
                <Link
                  to="/cart"
                  className="text-xs font-bold tracking-wide text-brand uppercase hover:text-brand-dark"
                >
                  Edit bag
                </Link>
              </div>
              <ul className="mt-4">
                {items.map((item) => (
                  <OrderItemRow
                    key={`${item.productId}-${item.size}`}
                    item={item}
                  />
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PaymentSummary
              items={items}
              ctaLabel="Continue to payment"
              ctaFormId={FORM_ID}
            />
            <p className="mt-3 text-center text-xs text-muted">
              By continuing, you agree to MintraECM’s guest checkout terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
