import { Product } from './models.js';

// Product imagery is provided by Unsplash; missing images fall back to a styled placeholder in the client.
const rows = [
  [
    "FK-101",
    "Canvas Backpack",
    "Accessories",
    899,
    1899,
    12,
    "photo-1553062407-98eeb64c6a62",
    "Urban Trail",
    4.5,
    1225,
    "Bestseller"
  ],
  [
    "FK-102",
    "USB-C Charging Cable",
    "Electronics",
    249,
    699,
    30,
    "photo-1583394838336-acd977736f90",
    "VoltEdge",
    4.3,
    2693,
    "Limited deal"
  ],
  [
    "FK-103",
    "Wireless Mouse",
    "Electronics",
    749,
    1999,
    18,
    "photo-1527814050087-3793815479db",
    "KeyNova",
    4.4,
    8241,
    "Top rated"
  ],
  [
    "FK-104",
    "Ceramic Coffee Mug",
    "Home",
    399,
    999,
    8,
    "photo-1514228742587-6b1558fcca3d",
    "ClayCraft",
    4.6,
    1084,
    "Trending"
  ],
  [
    "FK-105",
    "Desk Organizer",
    "Home",
    549,
    1299,
    15,
    "photo-1544816155-12df9643f363",
    "WorkSpace",
    4.4,
    728,
    "Popular"
  ],
  [
    "FK-106",
    "Stainless Steel Bottle",
    "Accessories",
    699,
    1499,
    9,
    "photo-1602143407151-7111542de6e8",
    "HydraGo",
    4.7,
    3054,
    "Bestseller"
  ],
  [
    "FK-107",
    "Nova X5 Smartphone",
    "Electronics",
    18999,
    25999,
    16,
    "photo-1511707171634-5f897ff02aa9",
    "Nova",
    4.5,
    15824,
    "Extra 12% off"
  ],
  [
    "FK-108",
    "Studio Wireless Headphones",
    "Electronics",
    2299,
    4999,
    18,
    "photo-1505740420928-5e560c06d30e",
    "SoundBeat",
    4.6,
    9721,
    "Hot deal"
  ],
  [
    "FK-109",
    "Classic Analog Watch",
    "Accessories",
    1599,
    3999,
    22,
    "photo-1523275335684-37898b6baf30",
    "Timelane",
    4.5,
    4310,
    "Bestseller"
  ],
  [
    "FK-110",
    "Everyday Running Sneakers",
    "Fashion",
    1299,
    3499,
    27,
    "photo-1542291026-7eec264c27ff",
    "Stride",
    4.4,
    6943,
    "50%+ off"
  ],
  [
    "FK-111",
    "Cotton Oversized T-Shirt",
    "Fashion",
    499,
    1299,
    44,
    "photo-1521572163474-6864f9cf17ab",
    "Northline",
    4.5,
    3972,
    "Just dropped"
  ],
  [
    "FK-112",
    "Minimal Leather Handbag",
    "Fashion",
    1799,
    4499,
    9,
    "photo-1584917865442-de89df76afd3",
    "Avenue",
    4.3,
    2511,
    "Editors pick"
  ],
  [
    "FK-113",
    "Relaxed Denim Jacket",
    "Fashion",
    1999,
    4599,
    11,
    "photo-1551028719-00167b16eac5",
    "Northline",
    4.6,
    1639,
    "Trending"
  ],
  [
    "FK-114",
    "Aero Lightweight Laptop",
    "Electronics",
    46999,
    63999,
    7,
    "photo-1496181133206-80ce9b88a853",
    "Aero",
    4.6,
    1134,
    "Bank offers"
  ],
  [
    "FK-115",
    "Portable Bluetooth Speaker",
    "Electronics",
    1799,
    3899,
    23,
    "photo-1608043152269-423dbba4e7e1",
    "SoundBeat",
    4.5,
    2881,
    "Hot deal"
  ],
  [
    "FK-116",
    "Instant Film Camera",
    "Electronics",
    5999,
    8499,
    13,
    "photo-1516035069371-29a1b244cc32",
    "Snapster",
    4.7,
    1028,
    "Gift favourite"
  ],
  [
    "FK-117",
    "Soft Linen Cushion Set",
    "Home",
    999,
    2499,
    26,
    "photo-1584100936595-c0654b55a2e2",
    "Casa",
    4.5,
    1532,
    "Home edit"
  ],
  [
    "FK-118",
    "Nordic Table Lamp",
    "Home",
    1799,
    3599,
    18,
    "photo-1507473885765-e6ed057f782c",
    "Casa",
    4.4,
    1807,
    "Home edit"
  ],
  [
    "FK-119",
    "Cozy Accent Chair",
    "Home",
    6999,
    11999,
    6,
    "photo-1503602642458-232111445657",
    "NestLiving",
    4.7,
    437,
    "Special price"
  ],
  [
    "FK-120",
    "Air Fryer 4L",
    "Appliances",
    4499,
    8999,
    12,
    "photo-1585515320310-259814833e62",
    "KitchenPro",
    4.6,
    2988,
    "Hot deal"
  ],
  [
    "FK-121",
    "Espresso Coffee Maker",
    "Appliances",
    6499,
    11999,
    8,
    "photo-1517256673644-36ad11246d21",
    "BrewLab",
    4.5,
    1820,
    "Special price"
  ],
  [
    "FK-122",
    "Smoothie Blender",
    "Appliances",
    2199,
    3999,
    15,
    "photo-1570222094114-d054a817e56b",
    "KitchenPro",
    4.3,
    989,
    "Popular"
  ],
  [
    "FK-123",
    "Skincare Essentials Kit",
    "Beauty",
    1299,
    3199,
    28,
    "photo-1556229010-6c3f2c9ca5f8",
    "PureBloom",
    4.6,
    2417,
    "Bestseller"
  ],
  [
    "FK-124",
    "Daily Glow Serum",
    "Beauty",
    749,
    1799,
    32,
    "photo-1608248543803-ba4f8c70ae0b",
    "PureBloom",
    4.4,
    3318,
    "Hot deal"
  ],
  [
    "FK-125",
    "Matte Lip Collection",
    "Beauty",
    999,
    2499,
    19,
    "photo-1522335789203-aabd1fc54bc9",
    "Velvet",
    4.7,
    1345,
    "Trending"
  ],
  [
    "FK-126",
    "Training Yoga Mat",
    "Sports",
    899,
    1999,
    28,
    "photo-1599447421416-3414500d18a5",
    "FitSpace",
    4.5,
    2429,
    "Fitness edit"
  ],
  [
    "FK-127",
    "Adjustable Dumbbell Set",
    "Sports",
    2499,
    5499,
    13,
    "photo-1517836357463-d25dfeac3438",
    "FitSpace",
    4.6,
    1758,
    "Bestseller"
  ],
  [
    "FK-128",
    "Outdoor Travel Duffel",
    "Sports",
    1499,
    3499,
    16,
    "photo-1622560480605-d83c853bc5c3",
    "Urban Trail",
    4.5,
    903,
    "Popular"
  ],
  [
    "FK-129",
    "Sticker Sheet 12-Pack",
    "Accessories",
    49,
    149,
    40,
    "photo-1494438639946-1ebd1d20bf85",
    "CraftHaus",
    4.4,
    287,
    "Everyday deal"
  ]
];
export const demoProducts = rows.map(([sku, name, category, price, mrp, stock, photo, brand, rating, reviewCount, badge]) => ({
  sku, name, category, price, mrp, stock, brand, rating, reviewCount, badge,
  image: 'https://images.unsplash.com/' + photo + '?auto=format&fit=crop&w=850&q=82',
  description: name + ' by ' + brand + '. An everyday favourite, made for effortless quality and value.',
  features: [
    'Quality checked for everyday use',
    'Easy to explore and compare',
    'Secure demo checkout — no real payments',
    'Sample catalog item for training'
  ]
}));

// Automatically populate a fresh local database without resetting existing cart/order stock.
export async function ensureCatalog() {
  if (!demoProducts.length) return 0;
  const result = await Product.bulkWrite(demoProducts.map(item => ({
    updateOne: {
      filter: { sku: item.sku },
      update: {
        $setOnInsert: { sku: item.sku, name: item.name, category: item.category, price: item.price, stock: item.stock },
        $set: { brand: item.brand, mrp: item.mrp, image: item.image, description: item.description,
          rating: item.rating, reviewCount: item.reviewCount, badge: item.badge, features: item.features }
      },
      upsert: true
    }
  })), { ordered: false });
  return result.upsertedCount || 0;
}
