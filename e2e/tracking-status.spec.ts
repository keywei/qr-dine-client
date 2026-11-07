import { test, expect } from '@playwright/test';
import { createOrderStatusResolver } from '../src/composables/useOrderStatus';
import { mockTranslations } from './fixtures/factories';

test.describe('訂單即時狀態與進度切換測試 (Tracking Status)', () => {
  const { getStatusEmoji, getStatusTitle, getStatusDesc, getStepIndex } = createOrderStatusResolver(
    (key: string) => mockTranslations[key] || key,
  );

  test('現場付款未結帳狀態：Step 為 1 (待付款)，圖示為 ⏳，標題為等待付款', () => {
    // Arrange: 現場現金未付款訂單
    const initialOrder = { status: 'PENDING_PAYMENT', paymentStatus: 'UNPAID', paymentMethod: 'CASH' };

    // Act & Assert
    expect(getStepIndex(initialOrder.status, initialOrder.paymentStatus)).toBe(1);
    expect(getStatusEmoji(initialOrder.status)).toBe('⏳');
    expect(getStatusTitle(initialOrder.status, initialOrder.paymentStatus)).toBe('訂單已送出，等待付款');
    expect(getStatusDesc(initialOrder.status, initialOrder.paymentStatus, initialOrder.paymentMethod)).toContain('請至櫃檯現場結帳');
  });

  test('後台確認收款更新為 COOKING / PAID：Step 推進至 2 (製作中)，圖示為 🍳，標題為烹調中', () => {
    // Arrange: 已付款製作中訂單
    const updatedOrder = { status: 'COOKING', paymentStatus: 'PAID', paymentMethod: 'CASH' };

    // Act & Assert
    expect(getStepIndex(updatedOrder.status, updatedOrder.paymentStatus)).toBe(2);
    expect(getStatusEmoji(updatedOrder.status)).toBe('🍳');
    expect(getStatusTitle(updatedOrder.status, updatedOrder.paymentStatus)).toBe('大廚精心烹調中...');
    expect(getStatusDesc(updatedOrder.status, updatedOrder.paymentStatus, updatedOrder.paymentMethod)).toContain('全力準備您的美味餐點');
  });

  test('餐點完成更新為 COMPLETED：Step 推進至 3，圖示變更為 🎉', () => {
    // Arrange: 完成製作訂單
    const completedOrder = { status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'CASH' };

    // Act & Assert
    expect(getStepIndex(completedOrder.status, completedOrder.paymentStatus)).toBe(3);
    expect(getStatusEmoji(completedOrder.status)).toBe('🎉');
    expect(getStatusTitle(completedOrder.status, completedOrder.paymentStatus)).toBe('餐點製作完成！');
  });
});
