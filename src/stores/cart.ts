import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { CartItem, CheckoutInfo, DiningType, MenuItem } from '@/types';

export const useCartStore = defineStore('cart', () => {
  const diningType = ref<DiningType>((localStorage.getItem('dining_type') || 'DINE_IN') as DiningType);
  const tableCode = ref(localStorage.getItem('table_code') || '');
  const items = ref<CartItem[]>([]);
  const checkoutInfo = ref<CheckoutInfo>({});

  const totalCount = computed(() => items.value.reduce((acc, item) => acc + item.quantity, 0));
  const totalAmount = computed(() => items.value.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const categoryCounts = computed(() => {
    const map: Record<number, number> = {};
    for (const item of items.value) map[item.categoryId] = (map[item.categoryId] || 0) + item.quantity;
    return map;
  });

  const setDiningInfo = (type: DiningType, code?: string) => {
    diningType.value = type;
    localStorage.setItem('dining_type', type);
    const validCode = type === 'TAKEOUT' ? '' : (code || '');
    tableCode.value = validCode;
    validCode ? localStorage.setItem('table_code', validCode) : localStorage.removeItem('table_code');
  };

  const setCheckoutInfo = (info: CheckoutInfo) => {
    checkoutInfo.value = { ...info };
  };

  const addItem = (dish: MenuItem, quantity: number, selectedOptionsText: string, unitPrice: number) => {
    const itemKey = `${dish.id}_${selectedOptionsText || 'default'}`;
    const existing = items.value.find((it) => it.id === itemKey);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({
        id: itemKey,
        categoryId: dish.categoryId,
        menuItemId: dish.id,
        name: dish.name,
        basePrice: dish.price,
        price: unitPrice,
        quantity,
        imageUrl: dish.imageUrl,
        optionsText: selectedOptionsText,
      });
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    const index = items.value.findIndex((it) => it.id === cartItemId);
    if (index === -1) return;
    if (newQty <= 0) items.value.splice(index, 1);
    else items.value[index].quantity = newQty;
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
    clearCart,
  };
});
