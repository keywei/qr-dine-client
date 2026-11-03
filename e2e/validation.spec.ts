import { test, expect } from '@playwright/test';
import { validateCheckoutForm, validateField } from '../src/utils/validation';
import { useCheckoutValidation } from '../src/composables/useCheckoutValidation';

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

  test('欄位失焦 (Blur) 即時單一欄位驗證：精確回傳錯誤訊息，合法時回傳空字串', () => {
    // 模擬使用者截圖情境：內用、電話填 5、統編填 2、載具填 a
    const invalidForm = {
      diningType: 'DINE_IN' as const,
      customerPhone: '5',
      taxId: '2',
      invoiceCarrier: 'a',
      customerNote: '3',
    };

    expect(validateField('customerPhone', invalidForm)).toContain('09xxxxxxxx');
    expect(validateField('taxId', invalidForm)).toContain('8碼數字');
    expect(validateField('invoiceCarrier', invalidForm)).toContain('/開頭共8碼');
    expect(validateField('customerNote', invalidForm)).toBe('');

    // 合法情境檢驗
    const validForm = {
      diningType: 'DINE_IN' as const,
      customerPhone: '0912345678',
      taxId: '12345678',
      invoiceCarrier: '/ABC+123',
      customerNote: '少油少鹽',
    };
    expect(validateField('customerPhone', validForm)).toBe('');
    expect(validateField('taxId', validForm)).toBe('');
    expect(validateField('invoiceCarrier', validForm)).toBe('');
    expect(validateField('customerNote', validForm)).toBe('');
  });

  test('Keyin 即時 Debounce 驗證與有錯誤時擋住提交按鈕 (isSubmitDisabled)', async () => {
    const diningType = { value: 'DINE_IN' as const };
    const phone = { value: '' };
    const mockForm = () => ({
      diningType: diningType.value,
      customerPhone: phone.value,
      taxId: '',
      invoiceCarrier: '',
      customerNote: '',
    });

    const { errors, onKeyin, onBlur, isSubmitDisabled } = useCheckoutValidation(mockForm);

    // 初始內用狀態，無錯誤且非外帶，按鈕允許點擊
    expect(isSubmitDisabled.value).toBe(false);

    // 模擬使用者 keyin 錯誤電話 "5"
    phone.value = '5';
    onKeyin('customerPhone');

    // Debounce 尚未到達 300ms 前，error 尚未觸發
    expect(errors.value.customerPhone).toBe('');

    // 等待 350ms 後 debounce 觸發驗證
    await new Promise((r) => setTimeout(r, 350));
    expect(errors.value.customerPhone).toContain('09xxxxxxxx');
    // 有錯誤時，按鈕必須被擋住 (isSubmitDisabled === true)
    expect(isSubmitDisabled.value).toBe(true);

    // 使用者 blur 時應立即驗證
    phone.value = '0912345678';
    onBlur('customerPhone');
    expect(errors.value.customerPhone).toBe('');
    expect(isSubmitDisabled.value).toBe(false);

    // 外帶未填手機時，按鈕必須被擋住
    diningType.value = 'TAKEOUT';
    phone.value = '';
    onBlur('customerPhone');
    expect(isSubmitDisabled.value).toBe(true);
  });
});
