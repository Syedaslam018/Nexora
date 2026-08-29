export interface AdminCustomerListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
}

export interface AdminCustomerDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalCents: number;
    createdAt: string;
  }[];
}
