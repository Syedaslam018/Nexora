export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function paginationMeta(totalItems: number, { page, pageSize }: PaginationParams) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

export function paginationOffset({ page, pageSize }: PaginationParams) {
  return (page - 1) * pageSize;
}
