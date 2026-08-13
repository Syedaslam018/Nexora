import { prisma } from "../config/db.js";
import { hashOpaqueToken } from "../utils/tokens.js";

export const emailVerificationRepository = {
  create(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.emailVerification.create({ data: { userId, tokenHash, expiresAt } });
  },

  findValidByToken(token: string) {
    return prisma.emailVerification.findFirst({
      where: { tokenHash: hashOpaqueToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markUsed(id: string) {
    return prisma.emailVerification.update({ where: { id }, data: { usedAt: new Date() } });
  },
};
