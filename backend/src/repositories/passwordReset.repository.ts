import { prisma } from "../config/db.js";
import { hashOpaqueToken } from "../utils/tokens.js";

export const passwordResetRepository = {
  create(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordReset.create({ data: { userId, tokenHash, expiresAt } });
  },

  findValidByToken(token: string) {
    return prisma.passwordReset.findFirst({
      where: { tokenHash: hashOpaqueToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markUsed(id: string) {
    return prisma.passwordReset.update({ where: { id }, data: { usedAt: new Date() } });
  },

  invalidateAllForUser(userId: string) {
    return prisma.passwordReset.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
