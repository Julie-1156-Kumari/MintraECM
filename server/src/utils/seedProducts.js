import '../config/loadEnv.js';
import connectDB from '../config/db.js';
import Product from '../models/productModel.js';

/**
 * Catalog seed data — same styles as the client demo catalog,
 * but _id is omitted so MongoDB assigns real ObjectIds.
 */
export const seedCatalog = [
  {
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

/**
 * Insert seed catalog when the products collection is empty.
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<{ seeded: boolean, count: number, products: Array }>}
 */
export const seedProductsIfEmpty = async ({ force = false } = {}) => {
  const existing = await Product.countDocuments();
  if (existing > 0 && !force) {
    return { seeded: false, count: existing, products: [] };
  }

  if (force) {
    await Product.deleteMany({});
  }

  const products = await Product.insertMany(seedCatalog);
  return {
    seeded: true,
    count: products.length,
    products: products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      brand: p.brand,
    })),
  };
};

const isCli =
  process.argv[1] &&
  (process.argv[1].endsWith('seedProducts.js') ||
    process.argv[1].includes('seedProducts'));

if (isCli) {
  try {
    await connectDB();
    const force = process.argv.includes('--force');
    const result = await seedProductsIfEmpty({ force });
    if (result.seeded) {
      console.log(`Seeded ${result.count} products with MongoDB ObjectIds:`);
      result.products.forEach((p) => console.log(`  ${p._id}  ${p.brand} — ${p.name}`));
    } else {
      console.log(`Products already exist (${result.count}). Use --force to reseed.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}
