import type { DiningType } from '@/types/cart';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'LINE_PAY' | 'CREDIT_CARD' | 'ONLINE';

export interface OrderItem {
  id: number;
  menuItemId: number;
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
  orderNumber: string;
  tableId?: number | null;
  table?: Table | null;
  diningType: DiningType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  customerNote?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
