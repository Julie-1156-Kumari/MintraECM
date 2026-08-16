import { Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, Truck } from 'lucide-react';

const guarantees = [
  {
    icon: Truck,
    title: 'Fast delivery',
    text: 'Dispatch within 24 hours on most styles.',
  },
  {
    icon: RefreshCw,
    title: 'Easy returns',
    text: 'Hassle-free returns within 14 days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure checkout',
    text: 'Card payments protected by Stripe.',
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:gap-12">
        {guarantees.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-base font-semibold">{title}</p>
              <p className="mt-1 text-sm text-white/60">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link to="/" className="font-display text-xl font-bold text-brand">
              MintraECM
            </Link>
            <p className="mt-1 max-w-sm text-sm text-white/55">
              Fashion apparel, shoes & accessories — inspired by the Myntra shopping experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
            <Link to="/" className="transition hover:text-white">
              Shop
            </Link>
            <Link to="/cart" className="transition hover:text-white">
              Bag
            </Link>
            <Link to="/tracking" className="transition hover:text-white">
              Track order
            </Link>
            <a href="mailto:support@MintraECM.shop" className="transition hover:text-white">
              support@MintraECM.shop
            </a>
          </div>
        </div>
        <p className="pb-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} MintraECM. Customer shopping demo — not affiliated with Myntra.
        </p>
      </div>
    </footer>
  );
}
