import { Link } from 'react-router-dom';

/** Lightweight stub kept only if a route still needs a temporary page. */
export function PlaceholderPage({
  title,
  description,
  actionTo = '/',
  actionLabel = 'Back to Home',
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
        Coming soon
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-sm text-muted">{description}</p>
      <Link
        to={actionTo}
        className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
