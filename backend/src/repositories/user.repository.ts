import { prisma } from "../config/db.js";
import type { Role } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        // Every new user gets an empty cart + wishlist immediately, so
        // downstream cart/wishlist code never has to branch on "does this
        // user have a cart yet?" — it always exists.
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
  },

  markEmailVerified(id: string) {
    return prisma.user.update({ where: { id }, data: { isEmailVerified: true } });
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  updateProfile(
    id: string,
    data: Partial<{ firstName: string; lastName: string; phone: string | null }>,
  ) {
    return prisma.user.update({ where: { id }, data });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },

  setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },
};
