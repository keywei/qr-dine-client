export type DiningType = 'DINE_IN' | 'TAKEOUT';

export interface CartItem {
  id: string; // unique item key
  categoryId: number;
  menuItemId: number;
  name: string;
  basePrice: number;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  optionsText?: string;
  options?: string[];
}

export interface CheckoutInfo {
  customerPhone?: string;
  customerNote?: string;
  taxId?: string;
  invoiceCarrier?: string;
}
