import { defineStore } from 'pinia';
import type { CartItem, DiningType, MenuItem } from '@/types';

export const useCartStore = defineStore('cart', {
  state: () => ({
    diningType: (localStorage.getItem('dining_type') || 'DINE_IN') as DiningType,
    tableCode: localStorage.getItem('table_code') || '',
    items: [] as CartItem[],
  }),
  getters: {
    totalCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  },
  actions: {
    setDiningInfo(type: DiningType, tableCode?: string) {
      this.diningType = type;
      localStorage.setItem('dining_type', type);
      this.tableCode = tableCode || '';
      if (tableCode) {
        localStorage.setItem('table_code', tableCode);
      } else {
        localStorage.removeItem('table_code');
      }
    },
    addItem(dish: MenuItem, quantity: number, selectedOptionsText: string, unitPrice: number) {
      const itemKey = `${dish.id}_${selectedOptionsText || 'default'}`;
      const existing = this.items.find((it) => it.id === itemKey);

      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          id: itemKey,
          menuItemId: dish.id,
          name: dish.name,
          basePrice: dish.price,
          price: unitPrice,
          quantity,
          imageUrl: dish.imageUrl,
          optionsText: selectedOptionsText,
        });
      }
    },
    updateQuantity(cartItemId: string, newQty: number) {
      const index = this.items.findIndex((it) => it.id === cartItemId);
      if (index === -1) return;
      if (newQty <= 0) {
        this.items.splice(index, 1);
      } else {
        this.items[index].quantity = newQty;
      }
    },
    clearCart() {
      this.items = [];
    },
  },
});
