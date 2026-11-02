import { test, expect } from '@playwright/test';
import { createOrderStatusResolver } from '../src/composables/useOrderStatus';

const mockTranslations: Record<string, string> = {
  'status.pendingPaymentTitle': '訂單已送出，等待付款',
  'status.cookingTitle': '大廚精心烹調中...',
  'status.completedTitle': '餐點製作完成！',
  'status.cancelledTitle': '訂單已取消',
  'status.paidTitle': '已確認收款，準備製作',
  'status.cookingDesc': '廚房已接單並全力準備您的美味餐點，請稍候片刻。',
  'status.unpaidCashDesc': '請至櫃檯現場結帳，店員確認收款後將立即製作。',
  'status.completedDesc': '餐點已準備好，請至取餐櫃檯領取或等候送餐！',
  'status.defaultDesc': '感謝您的訂購，我們正為您處理中。',
};

test.describe('訂單即時狀態與進度切換測試 (Tracking Status)', () => {
  const { getStatusEmoji, getStatusTitle, getStatusDesc, getStepIndex } = createOrderStatusResolver(
    (key: string) => mockTranslations[key] || key,
  );

  test('現場付款未結帳狀態：Step 為 1 (待付款)，圖示為 ⏳，標題為等待付款', () => {
    const initialOrder = { status: 'PENDING_PAYMENT', paymentStatus: 'UNPAID', paymentMethod: 'CASH' };
    expect(getStepIndex(initialOrder.status, initialOrder.paymentStatus)).toBe(1);
    expect(getStatusEmoji(initialOrder.status)).toBe('⏳');
    expect(getStatusTitle(initialOrder.status, initialOrder.paymentStatus)).toBe('訂單已送出，等待付款');
    expect(getStatusDesc(initialOrder.status, initialOrder.paymentStatus, initialOrder.paymentMethod)).toContain('請至櫃檯現場結帳');
  });

  test('後台確認收款更新為 COOKING / PAID：Step 推進至 2 (製作中)，圖示為 🍳，標題為烹調中', () => {
    const updatedOrder = { status: 'COOKING', paymentStatus: 'PAID', paymentMethod: 'CASH' };
    // 驗證進度步數推進至 index 2 (製作中)
    expect(getStepIndex(updatedOrder.status, updatedOrder.paymentStatus)).toBe(2);
    // 驗證狀態圖示切換為 🍳
    expect(getStatusEmoji(updatedOrder.status)).toBe('🍳');
    // 驗證標題切換為大廚烹調
    expect(getStatusTitle(updatedOrder.status, updatedOrder.paymentStatus)).toBe('大廚精心烹調中...');
    expect(getStatusDesc(updatedOrder.status, updatedOrder.paymentStatus, updatedOrder.paymentMethod)).toContain('全力準備您的美味餐點');
  });

  test('餐點完成更新為 COMPLETED：Step 推進至 3，圖示變更為 🎉', () => {
    const completedOrder = { status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'CASH' };
    expect(getStepIndex(completedOrder.status, completedOrder.paymentStatus)).toBe(3);
    expect(getStatusEmoji(completedOrder.status)).toBe('🎉');
    expect(getStatusTitle(completedOrder.status, completedOrder.paymentStatus)).toBe('餐點製作完成！');
  });
});
