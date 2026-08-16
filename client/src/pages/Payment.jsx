import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { ArrowLeft, Lock } from 'lucide-react';
import PaymentSummary from '../components/PaymentSummary';
import {
  clearCart,
  clearCartRemote,
  selectCartId,
  selectCartItems,
} from '../redux/slices/cartSlice';
import {
  clearOrderState,
  setActiveOrder,
  setPaymentIntent,
} from '../redux/slices/orderSlice';
import {
  confirmPaymentStatus,
  createOrder,
  createPaymentIntent,
} from '../api/paymentApi';
import { getCartTotals } from '../utils/cartTotals';
import { formatCurrency } from '../utils/formatCurrency';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

function PaymentForm({ order, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePay = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setFormError('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: order.customerDetails?.name,
              email: order.customerDetails?.email,
              phone: order.customerDetails?.phone,
            },
          },
        },
      });

      if (error) {
        setFormError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
        navigate('/payment/failure', {
          replace: true,
          state: {
            reason: error.message,
            orderId: order._id,
            trackingNumber: order.trackingNumber,
          },
        });
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        try {
          await confirmPaymentStatus(paymentIntent.id);
        } catch (err) {
          // Webhook may already have marked the order paid
          console.warn(
            '[Payment] confirmPaymentStatus failed (webhook may have completed):',
            err.message
          );
        }
        await dispatch(clearCartRemote());
        dispatch(clearCart());
        dispatch(clearOrderState());
        toast.success('Payment successful');
        navigate('/payment/success', {
          replace: true,
          state: {
            trackingNumber: order.trackingNumber,
            orderId: order._id,
            amount: order.totalAmount,
          },
        });
        return;
      }

      toast.error('Payment was not completed');
      navigate('/payment/failure', {
        replace: true,
        state: {
          reason: `Unexpected status: ${paymentIntent?.status || 'unknown'}`,
          orderId: order._id,
          trackingNumber: order.trackingNumber,
        },
      });
    } catch (err) {
      const message = err.message || 'Payment failed';
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Card details
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pay {formatCurrency(amount)} securely with Stripe.
        </p>
        <div className="mt-4">
          <PaymentElement />
        </div>
        {formError && (
          <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted"
        >
          <Lock className="h-4 w-4" aria-hidden />
          {submitting ? 'Processing…' : `Pay ${formatCurrency(amount)}`}
        </button>
      </div>
    </form>
  );
}

export default function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const cartId = useSelector(selectCartId);
  const shippingDetails = useSelector((state) => state.order.shippingDetails);
  const activeOrder = useSelector((state) => state.order.activeOrder);
  const clientSecret = useSelector((state) => state.order.clientSecret);

  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  // Prevent React StrictMode from creating two PENDING orders
  const bootstrapInFlight = useRef(false);

  const totals = useMemo(() => getCartTotals(items), [items]);
  const itemsKey = useMemo(
    () =>
      items
        .map((i) => `${i.productId}:${i.size}:${i.quantity}`)
        .join('|'),
    [items]
  );

  useEffect(() => {
    if (!shippingDetails) {
      toast.info('Enter shipping details first');
      navigate('/checkout', { replace: true });
      return;
    }
    if (items.length === 0 && !activeOrder) {
      toast.info('Your bag is empty');
      navigate('/cart', { replace: true });
    }
  }, [shippingDetails, items.length, activeOrder, navigate]);

  useEffect(() => {
    if (!shippingDetails || clientSecret) {
      return undefined;
    }
    if (items.length === 0 && !activeOrder) {
      return undefined;
    }
    if (bootstrapInFlight.current) {
      return undefined;
    }

    bootstrapInFlight.current = true;
    setBootstrapping(true);
    setBootstrapError('');

    const bootstrap = async () => {
      try {
        let order = activeOrder;

        if (!order) {
          order = await createOrder({
            customerDetails: shippingDetails.customerDetails,
            shippingAddress: shippingDetails.shippingAddress,
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
            })),
            cartId: cartId || undefined,
          });
          // Always persist order in Redux (survives StrictMode remount)
          dispatch(setActiveOrder(order));
        }

        const intent = await createPaymentIntent(order._id);
        if (intent?.clientSecret) {
          dispatch(
            setPaymentIntent({
              paymentIntent: intent,
              clientSecret: intent.clientSecret,
            })
          );
        }
      } catch (err) {
        const message =
          err.message ||
          'Unable to start payment. Ensure the API is running and catalog products are stored in MongoDB (demo mock IDs are not valid order product IDs).';
        setBootstrapError(message);
        toast.error(message);
        bootstrapInFlight.current = false;
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
    return undefined;
  }, [
    shippingDetails,
    itemsKey,
    items,
    activeOrder,
    clientSecret,
    cartId,
    dispatch,
  ]);

  if (!shippingDetails) return null;

  const order = activeOrder;
  const amount = order?.totalAmount ?? totals.totalAmount;

  return (
    <div className="bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
              Payment
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
              Secure checkout
            </h1>
            <p className="mt-1 text-sm text-muted">
              Amount due{' '}
              <span className="font-semibold text-ink">
                {formatCurrency(amount)}
              </span>
            </p>
          </div>
          <Link
            to="/checkout"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 transition hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to address
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            {!stripePromise && (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                role="alert"
              >
                Missing{' '}
                <code className="font-mono text-xs">
                  VITE_STRIPE_PUBLISHABLE_KEY
                </code>{' '}
                in client env. Add your Stripe publishable key and restart Vite.
              </div>
            )}

            {bootstrapping && !clientSecret && (
              <div className="rounded-xl border border-line bg-white p-6 text-sm text-muted">
                Creating order and Stripe payment intent…
              </div>
            )}

            {bootstrapError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {bootstrapError}
              </div>
            )}

            {stripePromise && order && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <PaymentForm order={order} amount={order.totalAmount} />
              </Elements>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PaymentSummary
              items={items.length ? items : order?.items || []}
              showCta={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
