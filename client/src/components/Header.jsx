import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, Truck, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../redux/slices/cartSlice';
import SearchBar from './SearchBar';

const navLinkClass = ({ isActive }) =>
  `text-xs font-bold tracking-[0.12em] uppercase transition ${
    isActive ? 'text-brand' : 'text-ink/70 hover:text-brand'
  }`;

export default function Header() {
  const cartCount = useSelector(selectCartCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8">
        <button
          type="button"
          className="inline-flex rounded-md p-2 text-ink lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="font-display text-2xl font-bold tracking-tight text-brand">
            MintraECM
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/?category=Apparel" className={navLinkClass}>
            Apparel
          </NavLink>
          <NavLink to="/?category=Shoes" className={navLinkClass}>
            Shoes
          </NavLink>
          <NavLink to="/?category=Accessories" className={navLinkClass}>
            Accessories
          </NavLink>
          <NavLink to="/tracking" className={navLinkClass}>
            Track Order
          </NavLink>
        </nav>

        <div className="mx-auto hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-lg">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/tracking"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-ink/70 transition hover:bg-surface hover:text-brand sm:inline-flex"
          >
            <Truck className="h-4 w-4" aria-hidden />
            Track
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-ink transition hover:bg-surface hover:text-brand"
            aria-label={`Bag, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 py-0.5 text-[10px] font-bold leading-none text-white sm:static sm:min-w-5">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="border-t border-line px-4 py-2.5 md:hidden">
        <SearchBar />
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-line bg-white px-4 py-4 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-3">
            <li>
              <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/?category=Apparel"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Apparel
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/?category=Shoes"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Shoes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/?category=Accessories"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Accessories
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tracking"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Track Order
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
