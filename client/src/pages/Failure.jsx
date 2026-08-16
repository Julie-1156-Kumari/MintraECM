import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle } from 'lucide-react';
import { retryPayment } from '../api/paymentApi';
import { useDispatch } from 'react-redux';
import { setActiveOrder, setPaymentIntent } from '../redux/slices/orderSlice';

export default function Failure() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reason = state?.reason || 'Your payment could not be completed.';
  const orderId = state?.orderId;

  const handleRetry = async () => {
    if (!orderId) {
      navigate('/checkout');
      return;
    }
    try {
      const result = await retryPayment(orderId);
      dispatch(setActiveOrder({ _id: orderId, trackingNumber: state?.trackingNumber }));
      dispatch(
        setPaymentIntent({
          paymentIntent: result,
          clientSecret: result.clientSecret,
        })
      );
      toast.info('Ready to retry payment');
      navigate('/payment');
    } catch (err) {
      toast.error(err.message || 'Unable to retry payment');
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="font-display mt-5 text-2xl font-bold text-ink">
        Payment failed
      </h1>
      <p className="mt-2 text-sm text-muted">{reason}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Retry payment
        </button>
        <Link
          to="/cart"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-bold text-ink hover:border-brand hover:text-brand"
        >
          Back to bag
        </Link>
      </div>
    </div>
  );
}
