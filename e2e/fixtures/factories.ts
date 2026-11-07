import type { MenuItem, QueueTicket } from '../../src/types';

export const createMockMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 101,
  categoryId: 1,
  name: '招牌牛肉麵',
  price: 150,
  description: '',
  imageUrl: null,
  isAvailable: true,
  ...overrides,
});

export const createMockQueueTicket = (overrides: Partial<QueueTicket> = {}): QueueTicket => ({
  id: 101,
  ticketNo: 15,
  customerPhone: '0912345678',
  partySize: 2,
  status: 'WAITING',
  callCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCheckoutForm = (overrides = {}) => ({
  diningType: 'DINE_IN' as 'DINE_IN' | 'TAKEOUT',
  customerPhone: '0912345678',
  taxId: '',
  invoiceCarrier: '',
  customerNote: '',
  ...overrides,
});

export const mockTranslations: Record<string, string> = {
  'status.pendingPaymentTitle': '訂單已送出，等待付款',
  'status.cookingTitle': '大廚精心烹調中...',
  'status.completedTitle': '餐點製作完成！',
  'status.paidTitle': '已確認收款，準備製作',
  'status.cookingDesc': '廚房已接單並全力準備您的美味餐點，請稍候片刻。',
  'status.unpaidCashDesc': '請至櫃檯現場結帳，店員確認收款後將立即製作。',
  'status.completedDesc': '餐點已準備好，請至取餐櫃檯領取或等候送餐！',
};

