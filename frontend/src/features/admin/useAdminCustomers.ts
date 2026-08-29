import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminCustomersApi } from "@/api/adminCustomers.api";

const KEY = ["admin", "customers"];

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function useAdminCustomerList(params: { search?: string; page?: number }) {
  return useQuery({
    queryKey: [...KEY, "list", params],
    queryFn: () => adminCustomersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminCustomerDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => adminCustomersApi.detail(id as string),
    enabled: Boolean(id),
  });
}

export function useSetCustomerActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminCustomersApi.setActive(id, isActive),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KEY }),
    onError: (err) => toast.error(errorMessage(err, "Couldn't update account")),
  });
}

export function useSetCustomerRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "CUSTOMER" | "STAFF" | "ADMIN" }) =>
      adminCustomersApi.setRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't update role")),
  });
}
