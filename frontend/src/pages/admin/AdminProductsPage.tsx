import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateProductForm } from "@/features/admin/CreateProductForm";
import { useAdminProducts, useSetProductActive } from "@/features/admin/useAdminProducts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCents, cn } from "@/lib/utils";

export function AdminProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data, isLoading } = useAdminProducts({ search: search || undefined, page });
  const setActive = useSetProductActive();

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Button size="sm" onClick={() => setShowCreateForm((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New product
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateProductForm onDone={() => setShowCreateForm(false)} />
        </div>
      )}

      <Input
        value={searchInput}
        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        placeholder="Search by name or SKU…"
        className="mb-4 max-w-sm"
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="flex items-center gap-2 px-4 py-2">
                    {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-2 font-mono-data text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-2 text-right font-mono-data">{formatCents(p.basePriceCents)}</td>
                  <td className="px-4 py-2 text-right font-mono-data">{p.totalStock}</td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        p.isArchived
                          ? "bg-destructive/10 text-destructive"
                          : p.isActive
                            ? "bg-accent/15 text-accent-foreground"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {p.isArchived ? "Archived" : p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {!p.isArchived && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActive.mutate({ productId: p.id, isActive: !p.isActive })}
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-muted-foreground">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
