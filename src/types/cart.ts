export type DiningType = 'DINE_IN' | 'TAKEOUT';

export interface CartItem {
  id: string; // unique item key
  menuItemId: number;
  name: string;
  basePrice: number;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  optionsText?: string;
  options?: string[];
}

