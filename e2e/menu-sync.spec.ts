import { test, expect } from '@playwright/test';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../src/stores/cart';
import { handleMenuUpdateNotification } from '../src/composables/useMenuSync';
import type { MenuItemUpdatedPayload } from '../src/types';

test.describe('餐點異動即時同步與購物車檢測 (Menu Sync)', () => {
  test.beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockTranslate = (key: string, values?: Record<string, unknown>) => {
    if (key === 'cart.dishUnavailableNotice') return `您選購的餐點「${values?.name}」已下架或售罄`;
    if (key === 'cart.dishPriceUpdatedNotice') return `購物車中的「${values?.name}」價格已更新`;
    return key;
  };

  test('購物車內有該品項時，觸發下架/停售事件，品項應被自動移除並通知', () => {
    const cart = useCartStore();
    cart.addItem({ id: 101, categoryId: 1, name: '招牌牛肉麵', price: 150, description: '', imageUrl: null, isAvailable: true }, 2, '微辣', 150);
    expect(cart.items.length).toBe(1);
    expect(cart.totalAmount).toBe(300);

    const payload: MenuItemUpdatedPayload = { id: 101, name: '招牌牛肉麵', price: 150, isAvailable: false, action: 'toggle' };
    const res = handleMenuUpdateNotification(payload, cart, mockTranslate);
    expect(res.affected).toBe(true);
    expect(res.removed).toBe(true);
    expect(cart.items.length).toBe(0);
    expect(cart.totalAmount).toBe(0);
  });

  test('購物車內無該品項時，觸發下架事件，不影響購物車亦不觸發多餘動作', () => {
    const cart = useCartStore();
    cart.addItem({ id: 202, categoryId: 1, name: '滷肉飯', price: 50, description: '', imageUrl: null, isAvailable: true }, 1, '', 50);

    const payload: MenuItemUpdatedPayload = { id: 999, name: '珍珠奶茶', price: 60, isAvailable: false, action: 'toggle' };
    const res = handleMenuUpdateNotification(payload, cart, mockTranslate);
    expect(res.affected).toBe(false);
    expect(res.removed).toBe(false);
    expect(cart.items.length).toBe(1);
  });

  test('品項價格變更時，購物車金額與總額應同步聯動更新', () => {
    const cart = useCartStore();
    cart.addItem({ id: 303, categoryId: 2, name: '燙青菜', price: 40, description: '', imageUrl: null, isAvailable: true }, 3, '', 40);
    expect(cart.totalAmount).toBe(120);

    const payload: MenuItemUpdatedPayload = { id: 303, name: '特級燙青菜', price: 45, isAvailable: true, action: 'updated' };
    const res = handleMenuUpdateNotification(payload, cart, mockTranslate);
    expect(res.affected).toBe(true);
    expect(res.priceUpdated).toBe(true);
    expect(cart.items[0].name).toBe('特級燙青菜');
    expect(cart.items[0].price).toBe(45);
    expect(cart.totalAmount).toBe(135);
  });
});
