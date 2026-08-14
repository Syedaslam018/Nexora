import { apiClient, type ApiSuccessResponse } from "./client";
import type { Address, AddressInput } from "@/types/address";

export const addressesApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<Address[]>>("/addresses");
    return data.data;
  },

  async create(input: AddressInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<Address>>("/addresses", input);
    return data.data;
  },

  async update(id: string, input: Partial<AddressInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Address>>(`/addresses/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/addresses/${id}`);
  },
};
