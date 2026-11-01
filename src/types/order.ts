import type { DiningType } from '@/types/cart';

export type OrderStatus = 'PENDING_PAYMENT' | 'COOKING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'LINE_PAY' | 'CREDIT_CARD' | 'ONLINE';

export interface OrderItem {
  id: number;
  menuItemId?: number | null;
  name: string;
  price: number;
  quantity: number;
  optionsText?: string | null;
}

export interface Table {
  id: number;
  code: string;
  capacity?: number;
}

export interface Order {
  id: number;
  orderNo: string;
  tableId?: number | null;
  table?: Table | null;
  tableCode?: string;
  diningType: DiningType;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentMethod: PaymentMethod | string;
  totalAmount: number;
  customerNote?: string | null;
  customerPhone?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
