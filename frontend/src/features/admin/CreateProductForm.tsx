import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoryTree, useBrandList } from "@/features/products/useProducts";
import { useCreateProduct } from "./useAdminProducts";

interface FormValues {
  name: string;
  slug: string;
  description: string;
  sku: string;
  basePrice: number;
  compareAtPrice: number | "";
  brandId: string;
  categoryId: string;
  isActive: boolean;
  variantSku: string;
  variantName: string;
  initialQuantity: number;
}

/**
 * Creates a product with exactly one initial variant — the backend
 * (POST /api/products) supports multi-variant creation too, but a form for
 * adding further variants/images to an existing product is scoped out of
 * this phase (see docs/PROGRESS.md). Additional variants can still be
 * added directly via the API.
 */
export function CreateProductForm({ onDone }: { onDone?: () => void }) {
  const { data: categories } = useCategoryTree();
  const { data: brands } = useBrandList();
  const createProduct = useCreateProduct();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isActive: true, initialQuantity: 0 },
  });

  function onSubmit(values: FormValues) {
    createProduct.mutate(
      {
        name: values.name,
        slug: values.slug,
        description: values.description,
        sku: values.sku,
        basePriceCents: Math.round(Number(values.basePrice) * 100),
        compareAtPriceCents:
          values.compareAtPrice === "" ? undefined : Math.round(Number(values.compareAtPrice) * 100),
        brandId: values.brandId,
        categoryId: values.categoryId,
        isActive: values.isActive,
        variants: [
          {
            sku: values.variantSku,
            name: values.variantName,
            attributes: {},
            initialQuantity: Number(values.initialQuantity),
            lowStockThreshold: 5,
          },
        ],
      },
      { onSuccess: () => { reset(); onDone?.(); } },
    );
  }

  const flatCategories = categories?.flatMap((c) => [c, ...c.children]) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug", { required: true })} placeholder="my-product-name" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register("description", { required: true })}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku", { required: true })} />
        </div>
        <div>
          <Label htmlFor="basePrice">Price ($)</Label>
          <Input id="basePrice" type="number" step="0.01" {...register("basePrice", { required: true })} />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare-at price ($, optional)</Label>
          <Input id="compareAtPrice" type="number" step="0.01" {...register("compareAtPrice")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="brandId">Brand</Label>
          <select id="brandId" {...register("brandId", { required: true })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select…</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" {...register("categoryId", { required: true })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select…</option>
            {flatCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-input p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Initial variant
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="variantSku">Variant SKU</Label>
            <Input id="variantSku" {...register("variantSku", { required: true })} />
          </div>
          <div>
            <Label htmlFor="variantName">Variant name</Label>
            <Input id="variantName" {...register("variantName", { required: true })} placeholder="Default" />
          </div>
          <div>
            <Label htmlFor="initialQuantity">Initial stock</Label>
            <Input id="initialQuantity" type="number" {...register("initialQuantity", { required: true })} />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} className="h-3.5 w-3.5 rounded border-input" />
        Active (visible in storefront)
      </label>

      <Button type="submit" isLoading={createProduct.isPending} className="w-fit">
        Create product
      </Button>
    </form>
  );
}
