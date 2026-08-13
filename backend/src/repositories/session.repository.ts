import { prisma } from "../config/db.js";
import { hashOpaqueToken } from "../utils/tokens.js";

export const sessionRepository = {
  create(data: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: hashOpaqueToken(data.refreshToken),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: data.expiresAt,
      },
    });
  },

  findById(id: string) {
    return prisma.session.findUnique({ where: { id } });
  },

  findValidByToken(refreshToken: string) {
    return prisma.session.findFirst({
      where: {
        refreshTokenHash: hashOpaqueToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  },

  revoke(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllForUser(userId: string) {
    return prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  listActiveForUser(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
    });
  },
};
