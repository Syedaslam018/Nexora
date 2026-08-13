export type Role = "CUSTOMER" | "ADMIN" | "STAFF";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isEmailVerified: boolean;
}
