import { customerRepository } from "../repositories/customer.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationMeta } from "../utils/pagination.js";
import type { Role } from "@prisma/client";

export const customerService = {
  async list(search: string | undefined, pagination: { page: number; pageSize: number }) {
    const { rows, totalItems } = await customerRepository.findManyForAdmin(search, pagination);
    return {
      items: rows.map((r) => ({
        id: r.id,
        email: r.email,
        firstName: r.first_name,
        lastName: r.last_name,
        role: r.role,
        isActive: r.is_active,
        createdAt: r.created_at,
        orderCount: Number(r.order_count),
        totalSpentCents: Number(r.total_spent_cents),
      })),
      meta: paginationMeta(totalItems, pagination),
    };
  },

  async getById(id: string) {
    const customer = await customerRepository.findByIdForAdmin(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    return customer;
  },

  async setActive(id: string, isActive: boolean, requestingAdminId: string) {
    if (id === requestingAdminId && !isActive) {
      throw ApiError.badRequest("You can't disable your own account");
    }
    return customerRepository.setActive(id, isActive);
  },

  async setRole(id: string, role: Role, requestingAdminId: string) {
    if (id === requestingAdminId && role !== "ADMIN") {
      throw ApiError.badRequest("You can't change your own role away from admin");
    }
    return customerRepository.setRole(id, role);
  },
};
