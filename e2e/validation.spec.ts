import { test, expect } from '@playwright/test';
import { validateCheckoutForm, validateField } from '../src/utils/validation';
import { useCheckoutValidation } from '../src/composables/useCheckoutValidation';
import { createMockCheckoutForm } from './fixtures/factories';

test.describe('結帳表單 Zod 驗證測試', () => {
  test('外帶情境：未填電話應阻擋，正確 09 手機應通過', () => {
    const empty = validateCheckoutForm(createMockCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '' }));
    expect(empty.success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '0812345678' })).success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ diningType: 'TAKEOUT', customerPhone: '0912345678' })).success).toBe(true);
  });

  test('內用情境：電話選填，但填寫錯誤時應阻擋', () => {
    expect(validateCheckoutForm(createMockCheckoutForm({ customerPhone: '' })).success).toBe(true);
    expect(validateCheckoutForm(createMockCheckoutForm({ customerPhone: '12345' })).success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ customerPhone: '0988123456' })).success).toBe(true);
  });

  test('手機條碼載具：選填，錯誤格式阻擋，/ 開頭共 8 碼通過', () => {
    expect(validateCheckoutForm(createMockCheckoutForm({ invoiceCarrier: 'ABC12345' })).success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ invoiceCarrier: '/ABC' })).success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ invoiceCarrier: '/ABC+123' })).success).toBe(true);
  });

  test('統一編號：選填，非 8 碼數字阻擋，8 碼數字通過', () => {
    expect(validateCheckoutForm(createMockCheckoutForm({ taxId: '1234' })).success).toBe(false);
    expect(validateCheckoutForm(createMockCheckoutForm({ taxId: '12345678' })).success).toBe(true);
  });

  test('備註需求：支援多行換行內容，超過 100 字阻擋', () => {
    const multiLine = '第一行：不要蔥\n第二行：要大辣\n第三行：分開裝';
    expect(validateCheckoutForm(createMockCheckoutForm({ customerNote: multiLine })).success).toBe(true);
    expect(validateCheckoutForm(createMockCheckoutForm({ customerNote: 'A'.repeat(101) })).success).toBe(false);
  });

  test('欄位失焦 (Blur) 即時單一欄位驗證：精確回傳錯誤訊息，合法時回傳空字串', () => {
    const invalidForm = createMockCheckoutForm({
      customerPhone: '5',
      taxId: '2',
      invoiceCarrier: 'a',
      customerNote: '3',
    });
    expect(validateField('customerPhone', invalidForm)).toContain('09xxxxxxxx');
    expect(validateField('taxId', invalidForm)).toContain('8碼數字');
    expect(validateField('invoiceCarrier', invalidForm)).toContain('/開頭共8碼');
    expect(validateField('customerNote', invalidForm)).toBe('');

    const validForm = createMockCheckoutForm({
      customerPhone: '0912345678',
      taxId: '12345678',
      invoiceCarrier: '/ABC+123',
      customerNote: '少油少鹽',
    });
    expect(validateField('customerPhone', validForm)).toBe('');
    expect(validateField('taxId', validForm)).toBe('');
    expect(validateField('invoiceCarrier', validForm)).toBe('');
    expect(validateField('customerNote', validForm)).toBe('');
  });

  test('Keyin 即時 Debounce 驗證與有錯誤時擋住提交按鈕 (isSubmitDisabled)', async () => {
    const diningType = { value: 'DINE_IN' as 'DINE_IN' | 'TAKEOUT' };
    const phone = { value: '' };
    const formGetter = () => createMockCheckoutForm({ diningType: diningType.value, customerPhone: phone.value });

    const { errors, onKeyin, onBlur, isSubmitDisabled } = useCheckoutValidation(formGetter);
    expect(isSubmitDisabled.value).toBe(false);

    // 模擬使用者 keyin 錯誤電話 "5"
    phone.value = '5';
    onKeyin('customerPhone');
    expect(errors.value.customerPhone).toBe('');

    // 等待 350ms 後 debounce 觸發驗證
    await new Promise((r) => setTimeout(r, 350));
    expect(errors.value.customerPhone).toContain('09xxxxxxxx');
    expect(isSubmitDisabled.value).toBe(true);

    // 使用者 blur 正確手機號碼時立即驗證解鎖
    phone.value = '0912345678';
    onBlur('customerPhone');
    expect(errors.value.customerPhone).toBe('');
    expect(isSubmitDisabled.value).toBe(false);

    // 外帶情境未填手機時，按鈕必須被擋住
    diningType.value = 'TAKEOUT';
    phone.value = '';
    onBlur('customerPhone');
    expect(isSubmitDisabled.value).toBe(true);
  });
});
