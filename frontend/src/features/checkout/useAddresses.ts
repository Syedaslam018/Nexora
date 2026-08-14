import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressesApi } from "@/api/addresses.api";
import type { AddressInput } from "@/types/address";

const ADDRESSES_KEY = ["addresses"];

export function useAddresses() {
  return useQuery({ queryKey: ADDRESSES_KEY, queryFn: () => addressesApi.list() });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => addressesApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
      toast.success("Address saved");
    },
    onError: () => toast.error("Couldn't save address"),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}
