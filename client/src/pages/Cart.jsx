import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingBag } from 'lucide-react';
import CartItem from '../components/CartItem';
import PaymentSummary from '../components/PaymentSummary';
import {
  selectCartCount,
  selectCartItems,
} from '../redux/slices/cartSlice';

export default function Cart() {
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartCount);

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
          Add products from the catalog to start checkout.
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
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
            Shopping bag
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-xl border border-line bg-white px-4 sm:px-6">
            {items.map((item) => (
              <CartItem
                key={`${item.productId}-${item.size}`}
                item={item}
              />
            ))}
          </section>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PaymentSummary
              items={items}
              ctaLabel="Proceed to checkout"
              onCta={() => navigate('/checkout')}
            />
            <Link
              to="/"
              className="mt-3 block text-center text-sm font-semibold text-ink/70 transition hover:text-brand"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
