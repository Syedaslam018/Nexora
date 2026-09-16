import { PrismaClient, Prisma, InventoryTxnType } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCE_URL = "https://dummyjson.com/products?limit=0";
const SOURCE_NAME = "DummyJSON";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  sku?: string;
  images?: string[];
  thumbnail?: string;
  reviews?: Array<{
    rating: number;
    comment: string;
  }>;
};

type SeedOptions = {
  dryRun: boolean;
  limit?: number;
  refreshImages: boolean;
};

function parseArgs(): SeedOptions {
  const args = new Set(process.argv.slice(2));

  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const parsedLimit = limitArg
    ? Number.parseInt(limitArg.split("=")[1], 10)
    : undefined;

  return {
    dryRun: args.has("--dry-run"),
    refreshImages: args.has("--refresh-images"),
    limit:
      parsedLimit && Number.isInteger(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : undefined,
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function toCents(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid price: ${value}`);
  }

  return Math.round(value * 100);
}

function safeRating(value: number | undefined): string {
  const rating = Number(value ?? 0);

  if (!Number.isFinite(rating)) return "0.0";

  return Math.min(5, Math.max(0, rating)).toFixed(1);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Nexora-Catalog-Importer/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} ${response.statusText} from ${url}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        const delay = 500 * 2 ** (attempt - 1);
        console.warn(
          `⚠️ Request failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`,
        );
        await sleep(delay);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown fetch error");
}

function validateProduct(product: DummyProduct) {
  if (!product.id) throw new Error("Source product is missing id.");
  if (!product.title?.trim()) throw new Error(`Product ${product.id} has no title.`);
  if (!product.description?.trim()) {
    throw new Error(`Product ${product.id} has no description.`);
  }
  if (!product.category?.trim()) {
    throw new Error(`Product ${product.id} has no category.`);
  }

  toCents(product.price);
}

async function getProducts(limit?: number): Promise<DummyProduct[]> {
  const data = await fetchJson<{ products: DummyProduct[] }>(SOURCE_URL);

  const products = limit ? data.products.slice(0, limit) : data.products;

  for (const product of products) {
    validateProduct(product);
  }

  return products;
}

async function upsertCategory(
  categoryName: string,
  products: DummyProduct[],
): Promise<string> {
  const slug = slugify(categoryName);

  const imageUrl = products
    .filter((product) => product.category === categoryName)
    .flatMap((product) => product.images ?? [])
    .find(Boolean);

  const category = await prisma.category.upsert({
    where: { slug },
    update: {
      name: categoryName,
      description: `${categoryName} products`,
      ...(imageUrl ? { imageUrl } : {}),
    },
    create: {
      name: categoryName,
      slug,
      description: `${categoryName} products`,
      imageUrl,
    },
  });

  return category.id;
}

async function upsertBrand(brandName: string): Promise<string> {
  const slug = slugify(brandName);

  const brand = await prisma.brand.upsert({
    where: { slug },
    update: {
      name: brandName,
    },
    create: {
      name: brandName,
      slug,
    },
  });

  return brand.id;
}

function buildProductSlug(product: DummyProduct): string {
  // The source ID makes the slug deterministic and prevents title collisions.
  return `${slugify(product.title)}-${product.id}`;
}

function buildSku(product: DummyProduct): string {
  const sourceSku = product.sku?.trim();

  // Prefer the source SKU. If unavailable, create a deterministic SKU.
  return sourceSku
    ? sourceSku.toUpperCase().replace(/\s+/g, "-")
    : `DUMMY-${String(product.id).padStart(6, "0")}`;
}

async function reconcileInventory(
  tx: Prisma.TransactionClient,
  variantId: string,
  sourceStock: number,
) {
  const targetStock = Math.max(0, Math.trunc(sourceStock));

  const existing = await tx.inventory.findUnique({
    where: { variantId },
  });

  if (!existing) {
    await tx.inventory.create({
      data: {
        variantId,
        availableQty: targetStock,
        reservedQty: 0,
        soldQty: 0,
        lowStockThreshold: Math.min(5, Math.max(1, targetStock || 1)),
      },
    });

    if (targetStock > 0) {
      await tx.inventoryTransaction.create({
        data: {
          variantId,
          type: InventoryTxnType.STOCK_ADDED,
          quantity: targetStock,
          referenceType: "SEED",
          referenceId: `dummyjson-${variantId}`,
          note: `Initial stock imported from ${SOURCE_NAME}`,
        },
      });
    }

    return;
  }

  // Never overwrite reserved/sold quantities. Reconcile only available stock.
  const delta = targetStock - existing.availableQty;

  if (delta === 0) return;

  const nextAvailable = existing.availableQty + delta;

  if (nextAvailable < 0) {
    throw new Error(
      `Inventory reconciliation would make available stock negative for variant ${variantId}.`,
    );
  }

  await tx.inventory.update({
    where: { variantId },
    data: {
      availableQty: nextAvailable,
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      variantId,
      type: InventoryTxnType.STOCK_ADJUSTED,
      quantity: delta,
      referenceType: "SEED_SYNC",
      referenceId: `dummyjson-${variantId}-${Date.now()}`,
      note: `Stock reconciled from ${SOURCE_NAME}: ${existing.availableQty} -> ${targetStock}`,
    },
  });
}

async function syncImages(
  tx: Prisma.TransactionClient,
  productId: string,
  variantId: string,
  product: DummyProduct,
  refreshImages: boolean,
) {
  if (!refreshImages) {
    const existingCount = await tx.productImage.count({
      where: { productId },
    });

    if (existingCount > 0) return 0;
  } else {
    await tx.productImage.deleteMany({
      where: { productId },
    });
  }

  const imageUrls = unique([
    ...(product.images ?? []),
    ...(product.thumbnail ? [product.thumbnail] : []),
  ].filter(Boolean));

  if (imageUrls.length === 0) return 0;

  await tx.productImage.createMany({
    data: imageUrls.map((url, position) => ({
      productId,
      variantId,
      url,
      altText: product.title,
      position,
    })),
    skipDuplicates: true,
  });

  return imageUrls.length;
}

async function syncProduct(
  product: DummyProduct,
  categoryIds: Map<string, string>,
  brandIds: Map<string, string>,
  options: SeedOptions,
) {
  const categoryId = categoryIds.get(product.category);
  if (!categoryId) {
    throw new Error(`Missing category for "${product.category}".`);
  }

  const brandName = product.brand?.trim() || "Generic";
  const brandId = brandIds.get(brandName);

  if (!brandId) {
    throw new Error(`Missing brand "${brandName}".`);
  }

  const sku = buildSku(product);
  const slug = buildProductSlug(product);
  const priceCents = toCents(product.price);
  const discount = Math.min(99.99, Math.max(0, product.discountPercentage ?? 0));

  const compareAtPriceCents =
    discount > 0
      ? Math.max(
          priceCents,
          Math.round(priceCents / (1 - discount / 100)),
        )
      : null;

  if (options.dryRun) {
    console.log(
      `   [dry-run] ${product.title} | ${sku} | ${product.category} | ${priceCents} cents`,
    );
    return {
      product: 0,
      variant: 0,
      images: 0,
      inventory: 0,
    };
  }

  return prisma.$transaction(
    async (tx) => {
      /*
       * We upsert by SKU because SKU is the stable product identity in the
       * local catalog. The slug is derived deterministically from source ID,
       * so it remains unique even when titles collide.
       */
      const dbProduct = await tx.product.upsert({
        where: { sku },
        update: {
          name: product.title.trim(),
          slug,
          description: product.description.trim(),
          basePriceCents: priceCents,
          compareAtPriceCents,
          brandId,
          categoryId,
          avgRating: new Prisma.Decimal(safeRating(product.rating)),
          isActive: true,
          isArchived: false,
        },
        create: {
          name: product.title.trim(),
          slug,
          description: product.description.trim(),
          sku,
          basePriceCents: priceCents,
          compareAtPriceCents,
          brandId,
          categoryId,
          avgRating: new Prisma.Decimal(safeRating(product.rating)),
          reviewCount: 0,
          isActive: true,
          isArchived: false,
        },
      });

      const variantSku = `${sku}-DEFAULT`;

      const variant = await tx.productVariant.upsert({
        where: { sku: variantSku },
        update: {
          productId: dbProduct.id,
          name: "Default",
          attributes: {
            source: SOURCE_NAME,
            sourceProductId: product.id,
          },
          isActive: true,
        },
        create: {
          productId: dbProduct.id,
          sku: variantSku,
          name: "Default",
          attributes: {
            source: SOURCE_NAME,
            sourceProductId: product.id,
          },
          isActive: true,
        },
      });

      const images = await syncImages(
        tx,
        dbProduct.id,
        variant.id,
        product,
        options.refreshImages,
      );

      await reconcileInventory(
        tx,
        variant.id,
        product.stock ?? 0,
      );

      return {
        product: 1,
        variant: 1,
        images,
        inventory: 1,
      };
    },
    {
      // A catalog row is small; keep each transaction short.
      maxWait: 10_000,
      timeout: 20_000,
    },
  );
}

async function main() {
  const options = parseArgs();

  console.log("🌱 Nexora production-quality catalog seed");
  console.log(`📡 Source: ${SOURCE_URL}`);
  console.log(`🧪 Dry run: ${options.dryRun}`);
  console.log(`🖼️ Refresh images: ${options.refreshImages}`);
  if (options.limit) console.log(`🔢 Limit: ${options.limit}`);

  const products = await getProducts(options.limit);

  console.log(`📦 Validated ${products.length} products`);

  // Detect source SKU collisions before touching the database.
  const skuOwners = new Map<string, number>();

  for (const product of products) {
    const sku = buildSku(product);
    const existingOwner = skuOwners.get(sku);

    if (existingOwner && existingOwner !== product.id) {
      throw new Error(
        `Source SKU collision: "${sku}" belongs to products ${existingOwner} and ${product.id}.`,
      );
    }

    skuOwners.set(sku, product.id);
  }

  const categoryIds = new Map<string, string>();
  const categoryNames = unique(products.map((p) => p.category));

  for (const categoryName of categoryNames) {
    const id = await upsertCategory(categoryName, products);
    categoryIds.set(categoryName, id);
  }

  console.log(`✅ Categories: ${categoryNames.length}`);

  const brandIds = new Map<string, string>();
  const brandNames = unique(
    products.map((p) => p.brand?.trim() || "Generic"),
  );

  for (const brandName of brandNames) {
    const id = await upsertBrand(brandName);
    brandIds.set(brandName, id);
  }

  console.log(`✅ Brands: ${brandNames.length}`);

  const totals = {
    product: 0,
    variant: 0,
    images: 0,
    inventory: 0,
  };

  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    const result = await syncProduct(
      product,
      categoryIds,
      brandIds,
      options,
    );

    totals.product += result.product;
    totals.variant += result.variant;
    totals.images += result.images;
    totals.inventory += result.inventory;

    if ((index + 1) % 25 === 0 || index + 1 === products.length) {
      console.log(
        `   Processed ${index + 1}/${products.length} products...`,
      );
    }
  }

  console.log("");
  console.log("🎉 Catalog sync completed");
  console.log(`   Products:   ${totals.product}`);
  console.log(`   Variants:   ${totals.variant}`);
  console.log(`   Images:     ${totals.images}`);
  console.log(`   Inventory:  ${totals.inventory}`);
  console.log(`   Categories: ${categoryNames.length}`);
  console.log(`   Brands:     ${brandNames.length}`);

  if (options.dryRun) {
    console.log("");
    console.log("ℹ️ Dry run only. No product/variant/image/inventory rows were written.");
  }
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Catalog seed failed:");

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error ${error.code}`);
      console.error(error.message);
      console.error(error.meta);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
