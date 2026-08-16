import { z } from 'zod';

export const customerDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,15})$/, 'Phone must be 10–15 digits'),
});

export const shippingAddressSchema = z.object({
  flatNo: z.string().trim().min(1, 'Flat / house number is required'),
  area: z.string().trim().min(1, 'Area / street is required'),
  town: z.string().trim().min(1, 'Town / locality is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
});

/** Flat form shape used by AddressForm (React Hook Form). */
export const addressFormSchema = customerDetailsSchema.merge(shippingAddressSchema);

/**
 * Split flat form values into the API/order payload shape.
 * @param {z.infer<typeof addressFormSchema>} values
 */
export const toShippingPayload = (values) => ({
  customerDetails: {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
  },
  shippingAddress: {
    flatNo: values.flatNo.trim(),
    area: values.area.trim(),
    town: values.town.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    pinCode: values.pinCode.trim(),
  },
});

/**
 * Flatten stored shipping details back into form defaults.
 * @param {Object|null} shippingDetails
 */
export const fromShippingPayload = (shippingDetails) => {
  if (!shippingDetails) return {};
  return {
    ...(shippingDetails.customerDetails || {}),
    ...(shippingDetails.shippingAddress || {}),
  };
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];
