import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { CartItem, CheckoutInfo, DiningType, MenuItem } from '@/types';

const getItem = (k: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null);
const setItem = (k: string, v: string) => typeof localStorage !== 'undefined' && localStorage.setItem(k, v);
const removeItem = (k: string) => typeof localStorage !== 'undefined' && localStorage.removeItem(k);

export const useCartStore = defineStore('cart', () => {
  const diningType = ref<DiningType>((getItem('dining_type') || 'DINE_IN') as DiningType);
  const tableCode = ref(getItem('table_code') || '');
  const items = ref<CartItem[]>([]);
  const checkoutInfo = ref<CheckoutInfo>({});

  const totalCount = computed(() => items.value.reduce((acc, it) => acc + it.quantity, 0));
  const totalAmount = computed(() => items.value.reduce((acc, it) => acc + it.price * it.quantity, 0));
  const categoryCounts = computed(() => {
    const map: Record<number, number> = {};
    for (const it of items.value) map[it.categoryId] = (map[it.categoryId] || 0) + it.quantity;
    return map;
  });

  const setDiningInfo = (type: DiningType, code?: string) => {
    diningType.value = type;
    setItem('dining_type', type);
    const valid = type === 'TAKEOUT' ? '' : (code || '');
    tableCode.value = valid;
    valid ? setItem('table_code', valid) : removeItem('table_code');
  };

  const setCheckoutInfo = (info: CheckoutInfo) => {
    checkoutInfo.value = { ...info };
  };

  const addItem = (dish: MenuItem, quantity: number, selectedOptionsText: string, unitPrice: number) => {
    const key = `${dish.id}_${selectedOptionsText || 'default'}`;
    const exist = items.value.find((it) => it.id === key);
    if (exist) exist.quantity += quantity;
    else {
      items.value.push({
        id: key, categoryId: dish.categoryId, menuItemId: dish.id, name: dish.name,
        basePrice: dish.price, price: unitPrice, quantity, imageUrl: dish.imageUrl, optionsText: selectedOptionsText,
      });
    }
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    const idx = items.value.findIndex((it) => it.id === cartItemId);
    if (idx === -1) return;
    qty <= 0 ? items.value.splice(idx, 1) : (items.value[idx].quantity = qty);
  };

  const removeByMenuItemId = (id: number) => {
    items.value = items.value.filter((it) => it.menuItemId !== id);
  };

  const updateItemInfo = (id: number, price: number, name?: string) => {
    items.value.forEach((it) => {
      if (it.menuItemId === id) {
        it.price = price + Math.max(0, it.price - it.basePrice);
        it.basePrice = price;
        if (name) it.name = name;
      }
    });
  };

  const clearCart = () => {
    items.value = [];
    checkoutInfo.value = {};
  };

  return {
    diningType,
    tableCode,
    items,
    checkoutInfo,
    totalCount,
    totalAmount,
    categoryCounts,
    setDiningInfo,
    setCheckoutInfo,
    addItem,
    updateQuantity,
    removeByMenuItemId,
    updateItemInfo,
    clearCart,
  };
});
