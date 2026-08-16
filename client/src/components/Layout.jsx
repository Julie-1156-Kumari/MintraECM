import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import { hydrateCart } from '../redux/slices/cartSlice';

export default function Layout() {
  const dispatch = useDispatch();

  // Restore bag from MongoDB on load / refresh (source of truth)
  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
