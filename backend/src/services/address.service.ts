import { addressRepository } from "../repositories/address.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type { AddressInput, UpdateAddressInput } from "../schemas/address.schema.js";

async function assertOwnership(userId: string, addressId: string) {
  const address = await addressRepository.findById(addressId);
  if (!address || address.userId !== userId) throw ApiError.notFound("Address not found");
  return address;
}

export const addressService = {
  list(userId: string) {
    return addressRepository.findAllForUser(userId);
  },

  async create(userId: string, input: AddressInput) {
    if (input.isDefault) await addressRepository.clearDefaultForUser(userId);
    return addressRepository.create(userId, input);
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    await assertOwnership(userId, addressId);
    if (input.isDefault) await addressRepository.clearDefaultForUser(userId);
    return addressRepository.update(addressId, input);
  },

  async remove(userId: string, addressId: string) {
    await assertOwnership(userId, addressId);
    await addressRepository.delete(addressId);
  },

  /** Used by checkout to confirm the selected address actually belongs to
   * the user placing the order — never trust an address id from the client
   * without checking ownership. */
  async assertBelongsToUser(userId: string, addressId: string) {
    return assertOwnership(userId, addressId);
  },
};
