import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';

/**
 * Debounced search input that syncs with the `search` URL query param.
 */
export default function SearchBar({ className = '', placeholder = 'Search for products, brands and more' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [value, setValue] = useState(urlSearch);

  useEffect(() => {
    setValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = value.trim();
      const next = new URLSearchParams(searchParams);

      if (trimmed) {
        next.set('search', trimmed);
      } else {
        next.delete('search');
      }

      const nextQuery = next.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) return;

      navigate({ pathname: '/', search: nextQuery ? `?${nextQuery}` : '' }, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [value, navigate, searchParams]);

  const clear = () => setValue('');

  return (
    <form
      role="search"
      className={`relative w-full ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="MintraECM-search" className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        id="MintraECM-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md border-0 bg-surface py-2.5 pr-10 pl-10 text-sm text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-brand/40"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted transition hover:bg-white hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
