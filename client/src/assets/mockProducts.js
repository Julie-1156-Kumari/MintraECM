/**
 * Fallback catalog used when the API is unreachable or the DB is empty.
 * Mirrors the server seed product shape.
 */
export const mockProducts = [
  {
    _id: 'mock-001',
    name: 'Men Slim Fit Casual Shirt',
    brand: 'Roadster',
    description:
      'A crisp cotton casual shirt with a modern slim fit, ideal for weekday layers and weekend outings.',
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    category: 'Apparel',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.2,
    numReviews: 1284,
  },
  {
    _id: 'mock-002',
    name: 'Women Floral Print Maxi Dress',
    brand: 'Libas',
    description:
      'Flowy floral maxi dress with soft rayon drape and a flattering waist tie.',
    price: 1299,
    originalPrice: 2499,
    discountPercent: 48,
    category: 'Apparel',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f1729e0016?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    rating: 4.5,
    numReviews: 892,
  },
  {
    _id: 'mock-003',
    name: 'Unisex Classic Leather Sneakers',
    brand: 'Puma',
    description:
      'Everyday leather sneakers with cushioned sole and clean minimal silhouette.',
    price: 2499,
    originalPrice: 4499,
    discountPercent: 44,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ],
    sizes: ['7', '8', '9', '10', '11'],
    inStock: true,
    rating: 4.4,
    numReviews: 2103,
  },
  {
    _id: 'mock-004',
    name: 'Women Running Shoes',
    brand: 'Nike',
    description:
      'Lightweight running shoes with breathable mesh upper and responsive cushioning.',
    price: 3999,
    originalPrice: 6995,
    discountPercent: 43,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec480c814d?w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
    ],
    sizes: ['5', '6', '7', '8'],
    inStock: true,
    rating: 4.6,
    numReviews: 3456,
  },
  {
    _id: 'mock-005',
    name: 'Men Cotton Cargo Joggers',
    brand: 'HRX',
    description:
      'Utility cargo joggers with elastic cuffs and multiple pockets for everyday comfort.',
    price: 999,
    originalPrice: 1999,
    discountPercent: 50,
    category: 'Apparel',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    rating: 4.1,
    numReviews: 674,
  },
  {
    _id: 'mock-006',
    name: 'Leather Crossbody Bag',
    brand: 'Fossil',
    description:
      'Compact leather crossbody with adjustable strap and secure zip compartments.',
    price: 3499,
    originalPrice: 5999,
    discountPercent: 42,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a67437f?w=800&q=80',
    ],
    sizes: ['One Size'],
    inStock: true,
    rating: 4.3,
    numReviews: 412,
  },
  {
    _id: 'mock-007',
    name: 'Aviator Sunglasses',
    brand: 'Ray-Ban',
    description:
      'Timeless metal-frame aviators with UV-protective lenses and a lightweight fit.',
    price: 4999,
    originalPrice: 8990,
    discountPercent: 44,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    ],
    sizes: ['One Size'],
    inStock: true,
    rating: 4.7,
    numReviews: 1890,
  },
  {
    _id: 'mock-008',
    name: 'Women Knitted Crop Top',
    brand: 'ONLY',
    description:
      'Soft knit crop top with ribbed texture — pair with high-waist denim or skirts.',
    price: 599,
    originalPrice: 1299,
    discountPercent: 54,
    category: 'Apparel',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
      'https://images.unsplash.com/photo-1485230895900-eb8353f4bfa4?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    rating: 4.0,
    numReviews: 523,
  },
  {
    _id: 'mock-009',
    name: 'Men Formal Oxford Shoes',
    brand: 'Red Tape',
    description:
      'Polished formal oxfords in genuine leather with cushioned insole for all-day wear.',
    price: 1899,
    originalPrice: 3799,
    discountPercent: 50,
    category: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1614252238971-5a8d0b1a0a1a?w=800&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
    ],
    sizes: ['7', '8', '9', '10'],
    inStock: false,
    rating: 4.2,
    numReviews: 298,
  },
  {
    _id: 'mock-010',
    name: 'Minimal Analog Watch',
    brand: 'Titan',
    description:
      'Slim analog watch with stainless steel case, leather strap, and water resistance.',
    price: 2799,
    originalPrice: 4595,
    discountPercent: 39,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
    ],
    sizes: ['One Size'],
    inStock: true,
    rating: 4.5,
    numReviews: 1102,
  },
];

export const mockCategories = ['Apparel', 'Shoes', 'Accessories'];

export const mockBrands = [
  ...new Set(mockProducts.map((p) => p.brand)),
].sort((a, b) => a.localeCompare(b));

/**
 * Filter mock products to mirror backend query behaviour.
 * @param {Object} params
 */
export const filterMockProducts = (params = {}) => {
  let list = [...mockProducts];
  const { search, category, brand, inStock, minPrice, maxPrice, sortBy, sortOrder } =
    params;

  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  if (category?.trim()) {
    const cat = category.trim().toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  if (brand?.trim()) {
    const b = brand.trim().toLowerCase();
    list = list.filter((p) => p.brand.toLowerCase() === b);
  }

  if (inStock !== undefined && inStock !== '') {
    const stocked = String(inStock).toLowerCase() === 'true';
    list = list.filter((p) => p.inStock === stocked);
  }

  if (minPrice !== undefined && minPrice !== '') {
    list = list.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    list = list.filter((p) => p.price <= Number(maxPrice));
  }

  const field = sortBy || 'createdAt';
  const order = sortOrder === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    const av = a[field] ?? 0;
    const bv = b[field] ?? 0;
    if (typeof av === 'string') return av.localeCompare(bv) * order;
    return (av - bv) * order;
  });

  return list;
};
