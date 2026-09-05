import { prisma } from "../src/config/db.js";
import { hashPassword } from "../src/utils/password.js";
import {
  CouponType,
  InventoryTxnType,
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  ReviewStatus,
  Role,
} from "@prisma/client";

/**
 * Development/demo data for a fresh Nexora database.
 *
 * The seed is intentionally idempotent: it uses stable slugs, SKUs, emails,
 * and coupon codes as keys, so it is safe to run after `prisma db push` (or
 * repeatedly while developing). Images use public Unsplash URLs so the
 * storefront has real image content without checking binary files into git.
 */

const image = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=85`;

const images = {
  fashion: image("photo-1521572163474-6864f9cf17ab"),
  jacket: image("photo-1551488831-00ddcb6c6bd3"),
  shoes: image("photo-1542291026-7eec264c27ff"),
  watch: image("photo-1523275335684-37898b6baf30"),
  bag: image("photo-1553062407-98eeb64c6a62"),
  sunglasses: image("photo-1511499767150-a48a237f0083"),
  headphones: image("photo-1505740420928-5e560c06d30e"),
  camera: image("photo-1516035069371-29a1b244cc32"),
  laptop: image("photo-1496181133206-80ce9b88a853"),
  phone: image("photo-1511707171634-5f897ff02aa9"),
  speaker: image("photo-1608043152269-423dbba4e7e1"),
  chair: image("photo-1586023492125-27b2c045efd7"),
  lamp: image("photo-1507473885765-50ed95c7e7d4"),
  coffee: image("photo-1495474472287-4d71bcdd2085"),
  skincare: image("photo-1556229010-6c3f2c9c8c4"),
  perfume: image("photo-1541643600914-78b084683601"),
  fitness: image("photo-1583454110551-21f2fa2afe61"),
};

const categories = [
  {
    name: "Fashion",
    slug: "fashion",
    description: "Everyday essentials and statement pieces.",
    imageUrl: images.fashion,
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Comfortable shoes for every occasion.",
    imageUrl: images.shoes,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Small details that complete your look.",
    imageUrl: images.watch,
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Smart devices and useful tech for modern life.",
    imageUrl: images.phone,
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Thoughtful objects for a more comfortable home.",
    imageUrl: images.chair,
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Daily care and personal fragrance.",
    imageUrl: images.skincare,
  },
  {
    name: "Fitness",
    slug: "fitness",
    description: "Simple equipment for stronger routines.",
    imageUrl: images.fitness,
  },
];

const brands = [
  { name: "Nexora Studio", slug: "nexora-studio", logoUrl: images.fashion },
  { name: "Northstar", slug: "northstar", logoUrl: images.shoes },
  { name: "Lumen Labs", slug: "lumen-labs", logoUrl: images.laptop },
  { name: "Hearth & Hue", slug: "hearth-and-hue", logoUrl: images.lamp },
  { name: "Verde", slug: "verde", logoUrl: images.skincare },
  { name: "Peak Form", slug: "peak-form", logoUrl: images.fitness },
];

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  basePriceCents: number;
  compareAtPriceCents?: number;
  category: string;
  brand: string;
  image: string;
  variantNames: string[];
};

const products: ProductSeed[] = [
  {
    name: "Essential Cotton Tee",
    slug: "essential-cotton-tee",
    sku: "NX-FSH-001",
    description: "A soft, heavyweight cotton tee with a relaxed everyday fit.",
    basePriceCents: 2499,
    compareAtPriceCents: 2999,
    category: "fashion",
    brand: "nexora-studio",
    image: images.fashion,
    variantNames: ["White", "Black", "Sage"],
  },
  {
    name: "Oversized Linen Shirt",
    slug: "oversized-linen-shirt",
    sku: "NX-FSH-002",
    description: "Breathable European linen cut for easy warm-weather layering.",
    basePriceCents: 5499,
    compareAtPriceCents: 6499,
    category: "fashion",
    brand: "nexora-studio",
    image: images.jacket,
    variantNames: ["Natural", "Sky"],
  },
  {
    name: "Merino Daily Cardigan",
    slug: "merino-daily-cardigan",
    sku: "NX-FSH-003",
    description: "Fine merino wool with a clean silhouette and soft hand feel.",
    basePriceCents: 8999,
    category: "fashion",
    brand: "northstar",
    image: images.jacket,
    variantNames: ["Oat", "Charcoal"],
  },
  {
    name: "Everyday Runner",
    slug: "everyday-runner",
    sku: "NX-FTW-001",
    description: "Lightweight knit runners with responsive foam cushioning.",
    basePriceCents: 7999,
    compareAtPriceCents: 9999,
    category: "footwear",
    brand: "northstar",
    image: images.shoes,
    variantNames: ["White / Navy", "All Black"],
  },
  {
    name: "Trail Hiker Mid",
    slug: "trail-hiker-mid",
    sku: "NX-FTW-002",
    description: "Weather-ready hiking shoes with grippy all-terrain soles.",
    basePriceCents: 11999,
    category: "footwear",
    brand: "northstar",
    image: images.shoes,
    variantNames: ["Moss", "Stone"],
  },
  {
    name: "Minimal Leather Loafer",
    slug: "minimal-leather-loafer",
    sku: "NX-FTW-003",
    description: "Polished full-grain leather loafers for work and weekends.",
    basePriceCents: 10499,
    compareAtPriceCents: 12499,
    category: "footwear",
    brand: "nexora-studio",
    image: images.shoes,
    variantNames: ["Black", "Cognac"],
  },
  {
    name: "Metro Chronograph",
    slug: "metro-chronograph",
    sku: "NX-ACC-001",
    description: "A brushed steel chronograph with a clean, readable dial.",
    basePriceCents: 14999,
    compareAtPriceCents: 17999,
    category: "accessories",
    brand: "northstar",
    image: images.watch,
    variantNames: ["Steel", "Graphite"],
  },
  {
    name: "Transit Canvas Tote",
    slug: "transit-canvas-tote",
    sku: "NX-ACC-002",
    description: "Durable waxed canvas tote with a padded laptop sleeve.",
    basePriceCents: 4499,
    category: "accessories",
    brand: "nexora-studio",
    image: images.bag,
    variantNames: ["Olive", "Natural"],
  },
  {
    name: "Atlas Polarized Sunglasses",
    slug: "atlas-polarized-sunglasses",
    sku: "NX-ACC-003",
    description: "Polarized lenses in a lightweight, timeless acetate frame.",
    basePriceCents: 5999,
    compareAtPriceCents: 6999,
    category: "accessories",
    brand: "northstar",
    image: images.sunglasses,
    variantNames: ["Tortoise", "Black"],
  },
  {
    name: "Orbit ANC Headphones",
    slug: "orbit-anc-headphones",
    sku: "NX-ELE-001",
    description: "Immersive wireless headphones with adaptive noise cancellation.",
    basePriceCents: 19999,
    compareAtPriceCents: 22999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.headphones,
    variantNames: ["Midnight", "Cloud"],
  },
  {
    name: "Lumen Air Laptop",
    slug: "lumen-air-laptop",
    sku: "NX-ELE-002",
    description: "A bright, fast 14-inch laptop for work, study, and creative projects.",
    basePriceCents: 89999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.laptop,
    variantNames: ["16 GB / 512 GB", "32 GB / 1 TB"],
  },
  {
    name: "Halo Pocket Camera",
    slug: "halo-pocket-camera",
    sku: "NX-ELE-003",
    description: "Compact mirrorless camera with crisp 4K video and image stabilization.",
    basePriceCents: 64999,
    compareAtPriceCents: 69999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.camera,
    variantNames: ["Body", "Body + 35mm Lens"],
  },
  {
    name: "Nova 5G Phone",
    slug: "nova-5g-phone",
    sku: "NX-ELE-004",
    description: "A vivid edge-to-edge display and all-day battery in a compact body.",
    basePriceCents: 59999,
    compareAtPriceCents: 64999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.phone,
    variantNames: ["128 GB", "256 GB"],
  },
  {
    name: "Arc Portable Speaker",
    slug: "arc-portable-speaker",
    sku: "NX-ELE-005",
    description: "Room-filling sound, splash resistance, and 18 hours of playback.",
    basePriceCents: 8999,
    compareAtPriceCents: 10999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.speaker,
    variantNames: ["Slate", "Sand"],
  },
  {
    name: "Hearth Reading Chair",
    slug: "hearth-reading-chair",
    sku: "NX-HOM-001",
    description:
      "Deep, supportive lounge chair upholstered in textured performance fabric.",
    basePriceCents: 32999,
    compareAtPriceCents: 37999,
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.chair,
    variantNames: ["Oat", "Forest"],
  },
  {
    name: "Mora Table Lamp",
    slug: "mora-table-lamp",
    sku: "NX-HOM-002",
    description: "Warm dimmable light with a sculptural ceramic base.",
    basePriceCents: 6999,
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.lamp,
    variantNames: ["Cream", "Terracotta"],
  },
  {
    name: "Cloud Knit Throw",
    slug: "cloud-knit-throw",
    sku: "NX-HOM-003",
    description: "A generously sized, machine-washable throw for cool evenings.",
    basePriceCents: 5999,
    compareAtPriceCents: 7499,
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.chair,
    variantNames: ["Ivory", "Sage"],
  },
  {
    name: "Stoneware Pour-Over Set",
    slug: "stoneware-pour-over-set",
    sku: "NX-HOM-004",
    description: "Hand-finished stoneware dripper, carafe, and matching cup.",
    basePriceCents: 4999,
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.coffee,
    variantNames: ["Sand", "Ink"],
  },
  {
    name: "Daily Hydration Serum",
    slug: "daily-hydration-serum",
    sku: "NX-BEA-001",
    description: "A lightweight hyaluronic acid serum for plump, comfortable skin.",
    basePriceCents: 3299,
    compareAtPriceCents: 3999,
    category: "beauty",
    brand: "verde",
    image: images.skincare,
    variantNames: ["30 ml", "60 ml"],
  },
  {
    name: "Botanical Cleansing Balm",
    slug: "botanical-cleansing-balm",
    sku: "NX-BEA-002",
    description: "A gentle oil-to-milk cleanser that melts away makeup and sunscreen.",
    basePriceCents: 2899,
    category: "beauty",
    brand: "verde",
    image: images.skincare,
    variantNames: ["50 g", "100 g"],
  },
  {
    name: "No. 04 Eau de Parfum",
    slug: "no-04-eau-de-parfum",
    sku: "NX-BEA-003",
    description: "A modern blend of cedar, bergamot, and soft iris.",
    basePriceCents: 7999,
    compareAtPriceCents: 8999,
    category: "beauty",
    brand: "verde",
    image: images.perfume,
    variantNames: ["30 ml", "75 ml"],
  },
  {
    name: "Daily Mineral SPF 40",
    slug: "daily-mineral-spf-40",
    sku: "NX-BEA-004",
    description: "Invisible mineral sunscreen with a comfortable, non-greasy finish.",
    basePriceCents: 2499,
    category: "beauty",
    brand: "verde",
    image: images.skincare,
    variantNames: ["50 ml"],
  },
  {
    name: "Adjustable Kettlebell",
    slug: "adjustable-kettlebell",
    sku: "NX-FIT-001",
    description: "Space-saving kettlebell with six weight settings for home training.",
    basePriceCents: 8999,
    compareAtPriceCents: 9999,
    category: "fitness",
    brand: "peak-form",
    image: images.fitness,
    variantNames: ["12 kg", "20 kg"],
  },
  {
    name: "Cork Yoga Mat",
    slug: "cork-yoga-mat",
    sku: "NX-FIT-002",
    description: "Naturally grippy cork surface over supportive, joint-friendly foam.",
    basePriceCents: 4999,
    compareAtPriceCents: 5999,
    category: "fitness",
    brand: "peak-form",
    image: images.fitness,
    variantNames: ["Standard", "Extra Long"],
  },
  {
    name: "Recovery Massage Ball",
    slug: "recovery-massage-ball",
    sku: "NX-FIT-003",
    description: "Firm textured ball for targeted mobility and post-workout recovery.",
    basePriceCents: 1499,
    category: "fitness",
    brand: "peak-form",
    image: images.fitness,
    variantNames: ["Cork", "Silicone"],
  },
  {
    name: "Performance Training Short",
    slug: "performance-training-short",
    sku: "NX-FIT-004",
    description: "Fast-drying four-way stretch shorts with a secure zip pocket.",
    basePriceCents: 3999,
    compareAtPriceCents: 4499,
    category: "fitness",
    brand: "peak-form",
    image: images.fashion,
    variantNames: ["Black", "Cobalt"],
  },
  {
    name: "Ribbed Lounge Pant",
    slug: "ribbed-lounge-pant",
    sku: "NX-FSH-004",
    description: "Soft ribbed jersey with a relaxed tapered leg for all-day comfort.",
    basePriceCents: 4999,
    category: "fashion",
    brand: "nexora-studio",
    image: images.fashion,
    variantNames: ["Black", "Mushroom"],
  },
  {
    name: "Structured Daypack",
    slug: "structured-daypack",
    sku: "NX-ACC-004",
    description: "A weather-resistant daypack with organized storage for city commutes.",
    basePriceCents: 6999,
    compareAtPriceCents: 7999,
    category: "accessories",
    brand: "nexora-studio",
    image: images.bag,
    variantNames: ["Black", "Canyon"],
  },
  {
    name: "Desk Focus Light",
    slug: "desk-focus-light",
    sku: "NX-HOM-005",
    description: "A compact LED task lamp with adjustable temperature and brightness.",
    basePriceCents: 5499,
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.lamp,
    variantNames: ["Black", "White"],
  },
  {
    name: "Pulse Smart Band",
    slug: "pulse-smart-band",
    sku: "NX-ELE-006",
    description:
      "A slim activity tracker with sleep insights and week-long battery life.",
    basePriceCents: 6999,
    compareAtPriceCents: 7999,
    category: "electronics",
    brand: "lumen-labs",
    image: images.watch,
    variantNames: ["Black", "Rose"],
  },
];

// Keep the hand-written hero products above, then add a larger deterministic
// catalog so the storefront, filtering, pagination, and admin tables have
// enough realistic data to exercise their production paths. The generated
// records use stable slugs/SKUs, so rerunning the seed remains idempotent.
const generatedCatalog = [
  {
    family: "Studio",
    category: "fashion",
    brand: "nexora-studio",
    image: images.fashion,
  },
  { family: "Northstar", category: "footwear", brand: "northstar", image: images.shoes },
  {
    family: "Transit",
    category: "accessories",
    brand: "nexora-studio",
    image: images.bag,
  },
  { family: "Lumen", category: "electronics", brand: "lumen-labs", image: images.laptop },
  {
    family: "Hearth",
    category: "home-living",
    brand: "hearth-and-hue",
    image: images.lamp,
  },
  { family: "Verde", category: "beauty", brand: "verde", image: images.skincare },
  { family: "Peak", category: "fitness", brand: "peak-form", image: images.fitness },
] as const;

for (let index = 0; index < 70; index += 1) {
  const collection = generatedCatalog[index % generatedCatalog.length];
  const number = index + 1;
  const slugFamily = collection.family.toLowerCase();
  products.push({
    name: `${collection.family} Collection Item ${number}`,
    slug: `${slugFamily}-collection-item-${number}`,
    sku: `NX-GEN-${String(number).padStart(3, "0")}`,
    description: `A thoughtfully designed ${collection.category} essential from the ${collection.family} collection, made for everyday use.`,
    basePriceCents: 2499 + (index % 14) * 750,
    compareAtPriceCents: index % 3 === 0 ? 3499 + (index % 14) * 750 : undefined,
    category: collection.category,
    brand: collection.brand,
    image: collection.image,
    variantNames: ["Standard", "Premium"],
  });
}

function productRecord(product: ProductSeed, brandId: string, categoryId: string) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    basePriceCents: product.basePriceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    brandId,
    categoryId,
    isActive: true,
    isArchived: false,
  };
}

async function main() {
  const categoryBySlug = new Map<string, { id: string }>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
    categoryBySlug.set(category.slug, row);
  }
  const brandBySlug = new Map<string, { id: string }>();
  for (const brand of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      create: brand,
      update: brand,
    });
    brandBySlug.set(brand.slug, row);
  }

  const passwordHash = await hashPassword("NexoraDemo123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexora.dev" },
    create: {
      email: "admin@nexora.dev",
      passwordHash,
      firstName: "Nexora",
      lastName: "Admin",
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    update: {
      passwordHash,
      firstName: "Nexora",
      lastName: "Admin",
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  const customers = await Promise.all(
    [
      ["alex@nexora.dev", "Alex", "Morgan"],
      ["jamie@nexora.dev", "Jamie", "Chen"],
      ["sam@nexora.dev", "Sam", "Patel"],
    ].map(([email, firstName, lastName]) =>
      prisma.user.upsert({
        where: { email },
        create: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: Role.CUSTOMER,
          isEmailVerified: true,
        },
        update: {
          passwordHash,
          firstName,
          lastName,
          role: Role.CUSTOMER,
          isEmailVerified: true,
          isActive: true,
        },
      }),
    ),
  );

  const addressByUser = new Map<string, { id: string }>();
  for (const user of [admin, ...customers]) {
    const existing = await prisma.address.findFirst({
      where: { userId: user.id, label: "Demo home" },
    });
    const address =
      existing ??
      (await prisma.address.create({
        data: {
          userId: user.id,
          label: "Demo home",
          fullName: `${user.firstName} ${user.lastName}`,
          phone: "+1 555 010 2024",
          line1: "100 Market Street",
          line2: "Suite 4B",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
          isDefault: true,
        },
      }));
    addressByUser.set(user.id, address);
  }

  const productBySlug = new Map<
    string,
    { id: string; name: string; sku: string; basePriceCents: number }
  >();
  const variantBySku = new Map<
    string,
    {
      id: string;
      productId: string;
      name: string;
      sku: string;
      priceCents: number | null;
    }
  >();
  for (const [index, product] of products.entries()) {
    const category = categoryBySlug.get(product.category);
    const brand = brandBySlug.get(product.brand);
    if (!category || !brand)
      throw new Error(`Missing category or brand for ${product.slug}`);
    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      create: productRecord(product, brand.id, category.id),
      update: productRecord(product, brand.id, category.id),
    });
    productBySlug.set(product.slug, row);
    const productImage = await prisma.productImage.findFirst({
      where: { productId: row.id, url: product.image, position: 0 },
    });
    if (!productImage)
      await prisma.productImage.create({
        data: {
          productId: row.id,
          url: product.image,
          altText: `${product.name} product image`,
          position: 0,
        },
      });
    for (const [variantIndex, variantName] of product.variantNames.entries()) {
      const sku = `${product.sku}-${String(variantIndex + 1).padStart(2, "0")}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku },
        create: {
          productId: row.id,
          sku,
          name: variantName,
          attributes: { option: variantName },
          priceCents: null,
          isActive: true,
        },
        update: {
          productId: row.id,
          name: variantName,
          attributes: { option: variantName },
          isActive: true,
        },
      });
      variantBySku.set(sku, {
        id: variant.id,
        productId: row.id,
        name: variant.name,
        sku: variant.sku,
        priceCents: variant.priceCents,
      });
      const quantity = 18 + ((index + variantIndex) % 15);
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        create: { variantId: variant.id, availableQty: quantity, lowStockThreshold: 5 },
        update: { availableQty: quantity, lowStockThreshold: 5 },
      });
      const txn = await prisma.inventoryTransaction.findFirst({
        where: {
          variantId: variant.id,
          type: InventoryTxnType.STOCK_ADDED,
          note: "Initial demo stock",
        },
      });
      if (!txn)
        await prisma.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            type: InventoryTxnType.STOCK_ADDED,
            quantity,
            note: "Initial demo stock",
            createdById: admin.id,
          },
        });
    }
  }

  const reviewCopy = [
    [
      "Exactly what I needed",
      "The quality is excellent and it arrived sooner than expected.",
    ],
    ["Great everyday upgrade", "Simple, well made, and looks even better in person."],
    ["Would recommend", "The photos were accurate and the fit is comfortable."],
  ];
  for (const [index, product] of products.entries()) {
    const productRow = productBySlug.get(product.slug)!;
    const reviewer = customers[index % customers.length];
    const rating = 4 + (index % 2);
    const [title, body] = reviewCopy[index % reviewCopy.length];
    await prisma.review.upsert({
      where: { productId_userId: { productId: productRow.id, userId: reviewer.id } },
      create: {
        productId: productRow.id,
        userId: reviewer.id,
        rating,
        title,
        body,
        isVerifiedPurchase: index % 3 !== 0,
        status: ReviewStatus.APPROVED,
      },
      update: {
        rating,
        title,
        body,
        isVerifiedPurchase: index % 3 !== 0,
        status: ReviewStatus.APPROVED,
      },
    });
    await prisma.product.update({
      where: { id: productRow.id },
      data: { avgRating: rating, reviewCount: 1 },
    });
  }

  const coupon = await prisma.coupon.upsert({
    where: { code: "WELCOME15" },
    create: {
      code: "WELCOME15",
      type: CouponType.PERCENTAGE,
      value: 15,
      minOrderValueCents: 5000,
      maxDiscountCents: 3000,
      startsAt: new Date(Date.now() - 86_400_000),
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
    update: {
      type: CouponType.PERCENTAGE,
      value: 15,
      minOrderValueCents: 5000,
      maxDiscountCents: 3000,
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      isActive: true,
    },
  });
  const saleCoupon = await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    create: {
      code: "FREESHIP",
      type: CouponType.FREE_SHIPPING,
      value: 0,
      startsAt: new Date(Date.now() - 86_400_000),
      expiresAt: new Date(Date.now() + 90 * 86_400_000),
      isActive: true,
    },
    update: {
      type: CouponType.FREE_SHIPPING,
      value: 0,
      expiresAt: new Date(Date.now() + 90 * 86_400_000),
      isActive: true,
    },
  });
  for (const product of products.slice(0, 8)) {
    const productId = productBySlug.get(product.slug)!.id;
    await prisma.couponProduct.upsert({
      where: { couponId_productId: { couponId: coupon.id, productId } },
      create: { couponId: coupon.id, productId },
      update: {},
    });
  }
  const fashionCategory = categoryBySlug.get("fashion")!;
  await prisma.couponCategory.upsert({
    where: {
      couponId_categoryId: { couponId: saleCoupon.id, categoryId: fashionCategory.id },
    },
    create: { couponId: saleCoupon.id, categoryId: fashionCategory.id },
    update: {},
  });

  for (const [index, customer] of customers.entries()) {
    const cart = await prisma.cart.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id },
      update: { couponId: index === 0 ? coupon.id : null },
    });
    const cartProduct = products[index * 2];
    const cartVariant = variantBySku.get(`${cartProduct.sku}-01`)!;
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: cartVariant.id } },
      create: { cartId: cart.id, variantId: cartVariant.id, quantity: index + 1 },
      update: { quantity: index + 1 },
    });
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id },
      update: {},
    });
    const wishProduct = products[index * 2 + 1];
    const wishVariant = variantBySku.get(`${wishProduct.sku}-01`)!;
    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productBySlug.get(wishProduct.slug)!.id,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId: productBySlug.get(wishProduct.slug)!.id,
        variantId: wishVariant.id,
      },
      update: { variantId: wishVariant.id },
    });
  }

  const orderStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.SHIPPED,
    OrderStatus.PROCESSING,
  ];
  for (const [index, customer] of customers.entries()) {
    const address = addressByUser.get(customer.id)!;
    const orderNumber = `NEX-DEMO-${String(index + 1).padStart(3, "0")}`;
    const orderProduct = products[index * 2 + 2];
    const product = productBySlug.get(orderProduct.slug)!;
    const variant = variantBySku.get(`${orderProduct.sku}-01`)!;
    const quantity = index + 1;
    const subtotal = orderProduct.basePriceCents * quantity;
    const discount = index === 0 ? Math.min(Math.round(subtotal * 0.15), 3000) : 0;
    const shipping = subtotal - discount >= 7500 ? 0 : 799;
    const tax = Math.round((subtotal - discount) * 0.08);
    const total = subtotal - discount + shipping + tax;
    await prisma.order.upsert({
      where: { orderNumber },
      create: {
        orderNumber,
        userId: customer.id,
        status: orderStatuses[index],
        paymentMethod: index === 1 ? PaymentMethod.COD : PaymentMethod.STRIPE,
        subtotalCents: subtotal,
        discountCents: discount,
        taxCents: tax,
        shippingCents: shipping,
        totalCents: total,
        couponId: index === 0 ? coupon.id : null,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        notes: "Demo order seeded by Nexora.",
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            productNameSnapshot: product.name,
            variantNameSnapshot: variant.name,
            skuSnapshot: variant.sku,
            unitPriceCents: orderProduct.basePriceCents,
            quantity,
            totalCents: subtotal,
          },
        },
        payments: {
          create: {
            provider: index === 1 ? PaymentProvider.COD : PaymentProvider.STRIPE,
            status: index === 2 ? PaymentStatus.PENDING : PaymentStatus.SUCCEEDED,
            amountCents: total,
          },
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: "Demo order created" },
            { status: orderStatuses[index], note: "Demo status history" },
          ],
        },
      },
      update: {
        status: orderStatuses[index],
        subtotalCents: subtotal,
        discountCents: discount,
        taxCents: tax,
        shippingCents: shipping,
        totalCents: total,
      },
    });
  }

  for (const customer of customers) {
    const existing = await prisma.notification.findFirst({
      where: { userId: customer.id, title: "Welcome to Nexora" },
    });
    if (!existing)
      await prisma.notification.create({
        data: {
          userId: customer.id,
          type: NotificationType.PROMOTIONAL,
          title: "Welcome to Nexora",
          message: "Your demo account is ready. Enjoy 15% off with WELCOME15.",
          metadata: { coupon: "WELCOME15" },
        },
      });
  }

  console.log(
    `Seeded ${categories.length} categories, ${brands.length} brands, ${products.length} products, ${customers.length + 1} users, 2 coupons, 3 orders, reviews, inventory, carts, and wishlists.`,
  );
  console.log("Demo login: admin@nexora.dev / NexoraDemo123! (ADMIN)");
  console.log("Demo login: alex@nexora.dev / NexoraDemo123! (CUSTOMER)");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
