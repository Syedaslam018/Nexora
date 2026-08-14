import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Men",
    slug: "men",
    description: "Men's fashion and accessories",
    children: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "T-shirts, shirts, hoodies and more",
      },
      {
        name: "Men's Shoes",
        slug: "mens-shoes",
        description: "Sneakers, casual and formal shoes",
      },
    ],
  },
  {
    name: "Women",
    slug: "women",
    description: "Women's fashion and accessories",
    children: [
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Dresses, tops, jeans and more",
      },
      {
        name: "Women's Shoes",
        slug: "womens-shoes",
        description: "Sneakers, heels and casual footwear",
      },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronics and gadgets",
    children: [
      {
        name: "Audio",
        slug: "audio",
        description: "Headphones, earbuds and speakers",
      },
      {
        name: "Smart Devices",
        slug: "smart-devices",
        description: "Smart watches and connected devices",
      },
    ],
  },
];

const brands = [
  {
    name: "Nike",
    slug: "nike",
    logoUrl: "https://placehold.co/200x200?text=Nike",
  },
  {
    name: "Adidas",
    slug: "adidas",
    logoUrl: "https://placehold.co/200x200?text=Adidas",
  },
  {
    name: "Levi's",
    slug: "levis",
    logoUrl: "https://placehold.co/200x200?text=Levis",
  },
  {
    name: "Puma",
    slug: "puma",
    logoUrl: "https://placehold.co/200x200?text=Puma",
  },
  {
    name: "Sony",
    slug: "sony",
    logoUrl: "https://placehold.co/200x200?text=Sony",
  },
  {
    name: "Samsung",
    slug: "samsung",
    logoUrl: "https://placehold.co/200x200?text=Samsung",
  },
];

const products = [
  {
    name: "Nike Air Max 270",
    slug: "nike-air-max-270",
    sku: "NIKE-AM270-001",
    description:
      "Modern lifestyle sneakers featuring a large Air unit for responsive cushioning and all-day comfort.",
    basePriceCents: 12999,
    compareAtPriceCents: 15999,
    brandSlug: "nike",
    categorySlug: "mens-shoes",
    rating: 4.7,
    reviewCount: 124,
    image: "https://placehold.co/800x800?text=Nike+Air+Max+270",
    variants: [
      {
        sku: "NIKE-AM270-001-BLK-8",
        name: "Black / Size 8",
        attributes: { color: "Black", size: "8" },
        priceCents: 12999,
        stock: 25,
      },
      {
        sku: "NIKE-AM270-001-BLK-9",
        name: "Black / Size 9",
        attributes: { color: "Black", size: "9" },
        priceCents: 12999,
        stock: 30,
      },
      {
        sku: "NIKE-AM270-001-BLK-10",
        name: "Black / Size 10",
        attributes: { color: "Black", size: "10" },
        priceCents: 12999,
        stock: 20,
      },
    ],
  },

  {
    name: "Adidas Ultraboost Light",
    slug: "adidas-ultraboost-light",
    sku: "ADIDAS-UBL-001",
    description:
      "Lightweight running shoes with responsive cushioning designed for everyday training and running.",
    basePriceCents: 14999,
    compareAtPriceCents: 17999,
    brandSlug: "adidas",
    categorySlug: "mens-shoes",
    rating: 4.8,
    reviewCount: 98,
    image: "https://placehold.co/800x800?text=Adidas+Ultraboost",
    variants: [
      {
        sku: "ADIDAS-UBL-001-WHT-8",
        name: "White / Size 8",
        attributes: { color: "White", size: "8" },
        priceCents: 14999,
        stock: 18,
      },
      {
        sku: "ADIDAS-UBL-001-WHT-9",
        name: "White / Size 9",
        attributes: { color: "White", size: "9" },
        priceCents: 14999,
        stock: 24,
      },
      {
        sku: "ADIDAS-UBL-001-WHT-10",
        name: "White / Size 10",
        attributes: { color: "White", size: "10" },
        priceCents: 14999,
        stock: 16,
      },
    ],
  },

  {
    name: "Levi's 501 Original Jeans",
    slug: "levis-501-original-jeans",
    sku: "LEVIS-501-001",
    description:
      "The iconic Levi's 501 Original jeans with a classic straight fit and timeless denim construction.",
    basePriceCents: 5999,
    compareAtPriceCents: 7499,
    brandSlug: "levis",
    categorySlug: "mens-clothing",
    rating: 4.6,
    reviewCount: 215,
    image: "https://placehold.co/800x800?text=Levis+501",
    variants: [
      {
        sku: "LEVIS-501-001-BLU-30",
        name: "Blue / 30",
        attributes: { color: "Blue", size: "30" },
        priceCents: 5999,
        stock: 35,
      },
      {
        sku: "LEVIS-501-001-BLU-32",
        name: "Blue / 32",
        attributes: { color: "Blue", size: "32" },
        priceCents: 5999,
        stock: 40,
      },
      {
        sku: "LEVIS-501-001-BLU-34",
        name: "Blue / 34",
        attributes: { color: "Blue", size: "34" },
        priceCents: 5999,
        stock: 28,
      },
    ],
  },

  {
    name: "Nike Sportswear T-Shirt",
    slug: "nike-sportswear-tshirt",
    sku: "NIKE-SWTS-001",
    description:
      "Classic cotton sportswear T-shirt with a comfortable everyday fit.",
    basePriceCents: 2499,
    compareAtPriceCents: 2999,
    brandSlug: "nike",
    categorySlug: "mens-clothing",
    rating: 4.5,
    reviewCount: 76,
    image: "https://placehold.co/800x800?text=Nike+T-Shirt",
    variants: [
      {
        sku: "NIKE-SWTS-001-BLK-S",
        name: "Black / Small",
        attributes: { color: "Black", size: "S" },
        priceCents: 2499,
        stock: 50,
      },
      {
        sku: "NIKE-SWTS-001-BLK-M",
        name: "Black / Medium",
        attributes: { color: "Black", size: "M" },
        priceCents: 2499,
        stock: 65,
      },
      {
        sku: "NIKE-SWTS-001-BLK-L",
        name: "Black / Large",
        attributes: { color: "Black", size: "L" },
        priceCents: 2499,
        stock: 45,
      },
    ],
  },

  {
    name: "Puma Essentials Hoodie",
    slug: "puma-essentials-hoodie",
    sku: "PUMA-HOOD-001",
    description:
      "Soft fleece hoodie with a relaxed fit, perfect for casual everyday wear.",
    basePriceCents: 4499,
    compareAtPriceCents: 5499,
    brandSlug: "puma",
    categorySlug: "mens-clothing",
    rating: 4.4,
    reviewCount: 61,
    image: "https://placehold.co/800x800?text=Puma+Hoodie",
    variants: [
      {
        sku: "PUMA-HOOD-001-GRY-M",
        name: "Grey / Medium",
        attributes: { color: "Grey", size: "M" },
        priceCents: 4499,
        stock: 30,
      },
      {
        sku: "PUMA-HOOD-001-GRY-L",
        name: "Grey / Large",
        attributes: { color: "Grey", size: "L" },
        priceCents: 4499,
        stock: 35,
      },
      {
        sku: "PUMA-HOOD-001-GRY-XL",
        name: "Grey / XL",
        attributes: { color: "Grey", size: "XL" },
        priceCents: 4499,
        stock: 20,
      },
    ],
  },

  {
    name: "Adidas Women's Running Shoes",
    slug: "adidas-womens-running-shoes",
    sku: "ADIDAS-WRUN-001",
    description:
      "Comfortable women's running shoes with lightweight construction and responsive cushioning.",
    basePriceCents: 8999,
    compareAtPriceCents: 10999,
    brandSlug: "adidas",
    categorySlug: "womens-shoes",
    rating: 4.7,
    reviewCount: 87,
    image: "https://placehold.co/800x800?text=Adidas+Women",
    variants: [
      {
        sku: "ADIDAS-WRUN-001-PNK-6",
        name: "Pink / Size 6",
        attributes: { color: "Pink", size: "6" },
        priceCents: 8999,
        stock: 20,
      },
      {
        sku: "ADIDAS-WRUN-001-PNK-7",
        name: "Pink / Size 7",
        attributes: { color: "Pink", size: "7" },
        priceCents: 8999,
        stock: 25,
      },
      {
        sku: "ADIDAS-WRUN-001-PNK-8",
        name: "Pink / Size 8",
        attributes: { color: "Pink", size: "8" },
        priceCents: 8999,
        stock: 18,
      },
    ],
  },

  {
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    sku: "SONY-XM5-001",
    description:
      "Premium wireless noise-cancelling headphones with immersive sound and long battery life.",
    basePriceCents: 29999,
    compareAtPriceCents: 34999,
    brandSlug: "sony",
    categorySlug: "audio",
    rating: 4.9,
    reviewCount: 342,
    image: "https://placehold.co/800x800?text=Sony+WH-1000XM5",
    variants: [
      {
        sku: "SONY-XM5-001-BLK",
        name: "Black",
        attributes: { color: "Black" },
        priceCents: 29999,
        stock: 15,
      },
      {
        sku: "SONY-XM5-001-SLV",
        name: "Silver",
        attributes: { color: "Silver" },
        priceCents: 29999,
        stock: 12,
      },
    ],
  },

  {
    name: "Samsung Galaxy Buds3 Pro",
    slug: "samsung-galaxy-buds3-pro",
    sku: "SAMSUNG-BUDS3-001",
    description:
      "Premium wireless earbuds with active noise cancellation and high-quality audio.",
    basePriceCents: 17999,
    compareAtPriceCents: 19999,
    brandSlug: "samsung",
    categorySlug: "audio",
    rating: 4.6,
    reviewCount: 189,
    image: "https://placehold.co/800x800?text=Galaxy+Buds3+Pro",
    variants: [
      {
        sku: "SAMSUNG-BUDS3-001-WHT",
        name: "White",
        attributes: { color: "White" },
        priceCents: 17999,
        stock: 22,
      },
      {
        sku: "SAMSUNG-BUDS3-001-SLV",
        name: "Silver",
        attributes: { color: "Silver" },
        priceCents: 17999,
        stock: 18,
      },
    ],
  },

  {
    name: "Samsung Galaxy Watch7",
    slug: "samsung-galaxy-watch7",
    sku: "SAMSUNG-W7-001",
    description:
      "Modern smartwatch with health tracking, fitness features and a vibrant AMOLED display.",
    basePriceCents: 24999,
    compareAtPriceCents: 28999,
    brandSlug: "samsung",
    categorySlug: "smart-devices",
    rating: 4.7,
    reviewCount: 156,
    image: "https://placehold.co/800x800?text=Galaxy+Watch7",
    variants: [
      {
        sku: "SAMSUNG-W7-001-BLK-40",
        name: "Black / 40mm",
        attributes: { color: "Black", size: "40mm" },
        priceCents: 24999,
        stock: 14,
      },
      {
        sku: "SAMSUNG-W7-001-BLK-44",
        name: "Black / 44mm",
        attributes: { color: "Black", size: "44mm" },
        priceCents: 26999,
        stock: 16,
      },
    ],
  },

  {
    name: "Levi's Women's Classic Denim Jacket",
    slug: "levis-womens-denim-jacket",
    sku: "LEVIS-WDJ-001",
    description:
      "Classic denim jacket with a versatile silhouette that works across seasons.",
    basePriceCents: 6999,
    compareAtPriceCents: 8499,
    brandSlug: "levis",
    categorySlug: "womens-clothing",
    rating: 4.5,
    reviewCount: 73,
    image: "https://placehold.co/800x800?text=Levis+Denim+Jacket",
    variants: [
      {
        sku: "LEVIS-WDJ-001-BLU-S",
        name: "Blue / Small",
        attributes: { color: "Blue", size: "S" },
        priceCents: 6999,
        stock: 25,
      },
      {
        sku: "LEVIS-WDJ-001-BLU-M",
        name: "Blue / Medium",
        attributes: { color: "Blue", size: "M" },
        priceCents: 6999,
        stock: 30,
      },
      {
        sku: "LEVIS-WDJ-001-BLU-L",
        name: "Blue / Large",
        attributes: { color: "Blue", size: "L" },
        priceCents: 6999,
        stock: 20,
      },
    ],
  },

  {
    name: "Puma Women's Essentials Sneakers",
    slug: "puma-womens-essentials-sneakers",
    sku: "PUMA-WES-001",
    description:
      "Everyday women's sneakers combining a clean design with lightweight comfort.",
    basePriceCents: 5499,
    compareAtPriceCents: 6499,
    brandSlug: "puma",
    categorySlug: "womens-shoes",
    rating: 4.3,
    reviewCount: 54,
    image: "https://placehold.co/800x800?text=Puma+Women",
    variants: [
      {
        sku: "PUMA-WES-001-WHT-6",
        name: "White / Size 6",
        attributes: { color: "White", size: "6" },
        priceCents: 5499,
        stock: 28,
      },
      {
        sku: "PUMA-WES-001-WHT-7",
        name: "White / Size 7",
        attributes: { color: "White", size: "7" },
        priceCents: 5499,
        stock: 32,
      },
      {
        sku: "PUMA-WES-001-WHT-8",
        name: "White / Size 8",
        attributes: { color: "White", size: "8" },
        priceCents: 5499,
        stock: 24,
      },
    ],
  },

  {
    name: "Nike Dri-FIT Training T-Shirt",
    slug: "nike-dri-fit-training-tshirt",
    sku: "NIKE-DRIFIT-001",
    description:
      "Moisture-wicking training T-shirt designed to keep you comfortable during workouts.",
    basePriceCents: 2999,
    compareAtPriceCents: 3499,
    brandSlug: "nike",
    categorySlug: "mens-clothing",
    rating: 4.8,
    reviewCount: 112,
    image: "https://placehold.co/800x800?text=Nike+Dri-FIT",
    variants: [
      {
        sku: "NIKE-DRIFIT-001-BLU-M",
        name: "Blue / Medium",
        attributes: { color: "Blue", size: "M" },
        priceCents: 2999,
        stock: 45,
      },
      {
        sku: "NIKE-DRIFIT-001-BLU-L",
        name: "Blue / Large",
        attributes: { color: "Blue", size: "L" },
        priceCents: 2999,
        stock: 50,
      },
      {
        sku: "NIKE-DRIFIT-001-BLU-XL",
        name: "Blue / XL",
        attributes: { color: "Blue", size: "XL" },
        priceCents: 2999,
        stock: 35,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting Nexora database seed...\n");

  // ─────────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────────

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    categoryMap.set(parent.slug, parent.id);

    for (const child of category.children) {
      const childCategory = await prisma.category.upsert({
        where: {
          slug: child.slug,
        },
        update: {
          name: child.name,
          description: child.description,
          parentId: parent.id,
        },
        create: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parent.id,
        },
      });

      categoryMap.set(childCategory.slug, childCategory.id);
    }
  }

  console.log(`✅ Categories seeded: ${categoryMap.size}`);

  // ─────────────────────────────────────────────
  // Brands
  // ─────────────────────────────────────────────

  const brandMap = new Map<string, string>();

  for (const brand of brands) {
    const result = await prisma.brand.upsert({
      where: {
        slug: brand.slug,
      },
      update: {
        name: brand.name,
        logoUrl: brand.logoUrl,
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        logoUrl: brand.logoUrl,
      },
    });

    brandMap.set(result.slug, result.id);
  }

  console.log(`✅ Brands seeded: ${brandMap.size}`);

  // ─────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────

  for (const productData of products) {
    const brandId = brandMap.get(productData.brandSlug);
    const categoryId = categoryMap.get(productData.categorySlug);

    if (!brandId) {
      throw new Error(
        `Brand "${productData.brandSlug}" not found for ${productData.name}`,
      );
    }

    if (!categoryId) {
      throw new Error(
        `Category "${productData.categorySlug}" not found for ${productData.name}`,
      );
    }

    const product = await prisma.product.upsert({
      where: {
        slug: productData.slug,
      },
      update: {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        basePriceCents: productData.basePriceCents,
        compareAtPriceCents: productData.compareAtPriceCents,
        brandId,
        categoryId,
        isActive: true,
        isArchived: false,
        avgRating: productData.rating,
        reviewCount: productData.reviewCount,
      },
      create: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        sku: productData.sku,
        basePriceCents: productData.basePriceCents,
        compareAtPriceCents: productData.compareAtPriceCents,
        brandId,
        categoryId,
        isActive: true,
        isArchived: false,
        avgRating: productData.rating,
        reviewCount: productData.reviewCount,
      },
    });

    // Remove existing images for this product so the seed
    // remains clean when run multiple times.
    await prisma.productImage.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: productData.image,
        altText: productData.name,
        position: 0,
      },
    });

    // ─────────────────────────────────────────────
    // Variants
    // ─────────────────────────────────────────────

    for (const variantData of productData.variants) {
      const variant = await prisma.productVariant.upsert({
        where: {
          sku: variantData.sku,
        },
        update: {
          productId: product.id,
          name: variantData.name,
          attributes: variantData.attributes,
          priceCents: variantData.priceCents,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: variantData.sku,
          name: variantData.name,
          attributes: variantData.attributes,
          priceCents: variantData.priceCents,
          isActive: true,
        },
      });

      // Create/update inventory.
      await prisma.inventory.upsert({
        where: {
          variantId: variant.id,
        },
        update: {
          availableQty: variantData.stock,
          lowStockThreshold: 5,
        },
        create: {
          variantId: variant.id,
          availableQty: variantData.stock,
          reservedQty: 0,
          soldQty: 0,
          lowStockThreshold: 5,
        },
      });
    }

    console.log(`   📦 ${product.name}`);
  }

  console.log(`\n✅ Products seeded: ${products.length}`);

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────

  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  const inventoryCount = await prisma.inventory.count();

  console.log("\n🎉 Nexora seed completed!");
  console.log(`   Products:  ${productCount}`);
  console.log(`   Variants:  ${variantCount}`);
  console.log(`   Inventory: ${inventoryCount}`);
}

main()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });