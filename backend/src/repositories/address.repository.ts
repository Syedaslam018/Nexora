import { prisma } from "../config/db.js";
import type { AddressInput, UpdateAddressInput } from "../schemas/address.schema.js";

export const addressRepository = {
  findAllForUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  },

  create(userId: string, input: AddressInput) {
    return prisma.address.create({ data: { ...input, userId } });
  },

  update(id: string, input: UpdateAddressInput) {
    return prisma.address.update({ where: { id }, data: input });
  },

  delete(id: string) {
    return prisma.address.delete({ where: { id } });
  },

  clearDefaultForUser(userId: string) {
    return prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  },
};
