import { prisma } from "../config/db.js";
import { Prisma, type Role } from "@prisma/client";

export interface AdminCustomerRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_active: boolean;
  created_at: Date;
  order_count: bigint;
  total_spent_cents: bigint;
}

export const customerRepository = {
  /**
   * One query, using Postgres's `FILTER` clause to aggregate order count
   * and lifetime spend per customer without a subquery or a second round
   * trip — only orders that actually represent revenue (not cancelled/
   * still-pending) count toward either figure.
   */
  async findManyForAdmin(
    search: string | undefined,
    pagination: { page: number; pageSize: number },
  ) {
    const searchClause = search
      ? Prisma.sql`AND (u.email ILIKE ${"%" + search + "%"} OR u.first_name ILIKE ${"%" + search + "%"} OR u.last_name ILIKE ${"%" + search + "%"})`
      : Prisma.empty;

    const rows = await prisma.$queryRaw<AdminCustomerRow[]>`
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
        COUNT(o.id) FILTER (WHERE o.status NOT IN ('CANCELLED', 'PENDING')) AS order_count,
        COALESCE(SUM(o.total_cents) FILTER (WHERE o.status NOT IN ('CANCELLED', 'PENDING')), 0) AS total_spent_cents
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'CUSTOMER' ${searchClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ${pagination.pageSize} OFFSET ${(pagination.page - 1) * pagination.pageSize}
    `;

    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count FROM users u WHERE u.role = 'CUSTOMER' ${searchClause}
    `;

    return { rows, totalItems: Number(countResult[0]?.count ?? 0) };
  },

  findByIdForAdmin(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, orderNumber: true, status: true, totalCents: true, createdAt: true },
        },
      },
    });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },

  setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },
};
