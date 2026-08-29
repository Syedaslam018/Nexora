export type NotificationType =
  | "ORDER_PLACED"
  | "PAYMENT_SUCCESSFUL"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "PASSWORD_RESET"
  | "LOW_INVENTORY"
  | "PROMOTIONAL";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
