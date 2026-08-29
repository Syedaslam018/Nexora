import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminCustomerList, useSetCustomerActive, useSetCustomerRole } from "@/features/admin/useAdminCustomers";
import { useCurrentUser } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCents, cn } from "@/lib/utils";

export function AdminCustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminCustomerList({ search: search || undefined, page });
  const setActive = useSetCustomerActive();
  const setRole = useSetCustomerRole();
  const currentUser = useCurrentUser();

  return (
    <main className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold">Customers</h1>

      <Input
        value={searchInput}
        onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        placeholder="Search by name or email…"
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
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Joined</th>
                <th className="px-4 py-2 text-right">Orders</th>
                <th className="px-4 py-2 text-right">Total spent</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <p className="font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right font-mono-data">{c.orderCount}</td>
                  <td className="px-4 py-2 text-right font-mono-data">{formatCents(c.totalSpentCents)}</td>
                  <td className="px-4 py-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", c.isActive ? "bg-accent/15 text-accent-foreground" : "bg-destructive/10 text-destructive")}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={c.role}
                      disabled={c.id === currentUser?.id}
                      onChange={(e) =>
                        setRole.mutate({ id: c.id, role: e.target.value as "CUSTOMER" | "STAFF" | "ADMIN" })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={c.id === currentUser?.id && c.isActive}
                      onClick={() => setActive.mutate({ id: c.id, isActive: !c.isActive })}
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </Button>
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
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
