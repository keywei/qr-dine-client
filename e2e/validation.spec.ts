import { test, expect } from '@playwright/test';
import { validateCheckoutForm } from '../src/utils/validation';

test.describe('結帳表單 Zod 驗證測試', () => {
  test('外帶情境：未填電話應阻擋，正確 09 手機應通過', () => {
    const emptyPhone = validateCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '' });
    expect(emptyPhone.success).toBe(false);
    if (!emptyPhone.success) expect(emptyPhone.error).toContain('手機號碼');

    const invalidPhone = validateCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '0812345678' });
    expect(invalidPhone.success).toBe(false);

    const validPhone = validateCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '0912345678' });
    expect(validPhone.success).toBe(true);
  });

  test('內用情境：電話選填，但填寫錯誤時應阻擋', () => {
    const noPhone = validateCheckoutForm({ diningType: 'DINE_IN', customerPhone: '' });
    expect(noPhone.success).toBe(true);

    const invalidPhone = validateCheckoutForm({ diningType: 'DINE_IN', customerPhone: '12345' });
    expect(invalidPhone.success).toBe(false);

    const validPhone = validateCheckoutForm({ diningType: 'DINE_IN', customerPhone: '0988123456' });
    expect(validPhone.success).toBe(true);
  });

  test('手機條碼載具：選填，錯誤格式阻擋，/ 開頭共 8 碼通過', () => {
    const invalidCarrier = validateCheckoutForm({ diningType: 'DINE_IN', invoiceCarrier: 'ABC12345' });
    expect(invalidCarrier.success).toBe(false);

    const invalidLength = validateCheckoutForm({ diningType: 'DINE_IN', invoiceCarrier: '/ABC' });
    expect(invalidLength.success).toBe(false);

    const validCarrier = validateCheckoutForm({ diningType: 'DINE_IN', invoiceCarrier: '/ABC+123' });
    expect(validCarrier.success).toBe(true);
  });

  test('統一編號：選填，非 8 碼數字阻擋，8 碼數字通過', () => {
    const invalidTaxId = validateCheckoutForm({ diningType: 'DINE_IN', taxId: '1234' });
    expect(invalidTaxId.success).toBe(false);

    const validTaxId = validateCheckoutForm({ diningType: 'DINE_IN', taxId: '12345678' });
    expect(validTaxId.success).toBe(true);
  });

  test('備註需求：支援多行換行內容，超過 100 字阻擋', () => {
    const multiLineNote = '第一行：不要蔥\n第二行：要大辣\n第三行：分開裝';
    const validNote = validateCheckoutForm({ diningType: 'DINE_IN', customerNote: multiLineNote });
    expect(validNote.success).toBe(true);

    const overLengthNote = 'A'.repeat(101);
    const invalidNote = validateCheckoutForm({ diningType: 'DINE_IN', customerNote: overLengthNote });
    expect(invalidNote.success).toBe(false);
  });
});
