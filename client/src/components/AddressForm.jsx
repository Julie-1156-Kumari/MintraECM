import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import {
  addressFormSchema,
  fromShippingPayload,
  INDIAN_STATES,
  toShippingPayload,
} from '../utils/validationSchemas';

const inputClass =
  'mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20';

const labelClass = 'text-sm font-semibold text-ink';

const EMPTY_DEFAULTS = {
  name: '',
  email: '',
  phone: '',
  flatNo: '',
  area: '',
  town: '',
  city: '',
  state: '',
  pinCode: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

/**
 * Zod-validated shipping + contact form (React Hook Form).
 * Submits { customerDetails, shippingAddress } via onSubmit.
 */
export default function AddressForm({
  formId = 'checkout-address-form',
  defaultShipping = null,
  onSubmit,
  submitLabel = 'Continue to payment',
  showSubmitButton = true,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      ...EMPTY_DEFAULTS,
      ...fromShippingPayload(defaultShipping),
    },
    mode: 'onBlur',
  });

  const handleValid = (values) => onSubmit(toShippingPayload(values));

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleValid)}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <User className="h-5 w-5 text-brand" aria-hidden />
          Contact details
        </h2>
        <p className="mt-1 text-sm text-muted">
          We’ll send order updates to this email and phone.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-name" className={labelClass}>
              Full name
            </label>
            <input
              id="checkout-name"
              autoComplete="name"
              className={inputClass}
              placeholder="e.g. Priya Sharma"
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label htmlFor="checkout-email" className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted" aria-hidden />
                Email
              </span>
            </label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="you@example.com"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="checkout-phone" className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted" aria-hidden />
                Phone
              </span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="10-digit mobile number"
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <MapPin className="h-5 w-5 text-brand" aria-hidden />
          Shipping address
        </h2>
        <p className="mt-1 text-sm text-muted">
          Deliveries are currently available across India.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-flatNo" className={labelClass}>
              Flat / house no.
            </label>
            <input
              id="checkout-flatNo"
              autoComplete="address-line1"
              className={inputClass}
              placeholder="A-12, Tower 3"
              {...register('flatNo')}
            />
            <FieldError message={errors.flatNo?.message} />
          </div>

          <div>
            <label htmlFor="checkout-area" className={labelClass}>
              Area / street
            </label>
            <input
              id="checkout-area"
              autoComplete="address-line2"
              className={inputClass}
              placeholder="MG Road"
              {...register('area')}
            />
            <FieldError message={errors.area?.message} />
          </div>

          <div>
            <label htmlFor="checkout-town" className={labelClass}>
              Town / locality
            </label>
            <input
              id="checkout-town"
              className={inputClass}
              placeholder="Indiranagar"
              {...register('town')}
            />
            <FieldError message={errors.town?.message} />
          </div>

          <div>
            <label htmlFor="checkout-city" className={labelClass}>
              City
            </label>
            <input
              id="checkout-city"
              autoComplete="address-level2"
              className={inputClass}
              placeholder="Bengaluru"
              {...register('city')}
            />
            <FieldError message={errors.city?.message} />
          </div>

          <div>
            <label htmlFor="checkout-state" className={labelClass}>
              State
            </label>
            <select
              id="checkout-state"
              autoComplete="address-level1"
              className={inputClass}
              {...register('state')}
            >
            <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <FieldError message={errors.state?.message} />
          </div>

          <div>
            <label htmlFor="checkout-pinCode" className={labelClass}>
              PIN code
            </label>
            <input
              id="checkout-pinCode"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className={inputClass}
              placeholder="560001"
              {...register('pinCode')}
            />
            <FieldError message={errors.pinCode?.message} />
          </div>
        </div>
      </section>

      {showSubmitButton && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-md bg-brand px-4 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted lg:hidden"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      )}
    </form>
  );
}
