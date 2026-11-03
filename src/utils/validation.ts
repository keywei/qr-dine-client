import { z } from 'zod';
import type { DiningType } from '@/types';

export const PHONE_REGEX = /^09\d{8}$/;
export const CARRIER_REGEX = /^\/[0-9A-Z+.-]{7}$/;
export const TAX_ID_REGEX = /^\d{8}$/;

export interface CheckoutFormInput {
  diningType: DiningType;
  customerPhone?: string;
  customerNote?: string;
  taxId?: string;
  invoiceCarrier?: string;
}

export type CheckoutFormField = 'customerPhone' | 'customerNote' | 'taxId' | 'invoiceCarrier';

export const checkoutSchema = z
  .object({
    diningType: z.enum(['DINE_IN', 'TAKEOUT']),
    customerPhone: z.string().optional().default(''),
    customerNote: z.string().max(100, '備註最多 100 字').optional().default(''),
    taxId: z.string().optional().default(''),
    invoiceCarrier: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const phone = (data.customerPhone || '').trim();
    if (data.diningType === 'TAKEOUT') {
      if (!phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '外帶請提供手機號碼方便取餐',
          path: ['customerPhone'],
        });
      } else if (!PHONE_REGEX.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '請輸入正確的台灣手機號碼（格式：09xxxxxxxx）',
          path: ['customerPhone'],
        });
      }
    } else if (phone && !PHONE_REGEX.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '請輸入正確的手機號碼（格式：09xxxxxxxx）',
        path: ['customerPhone'],
      });
    }

    const carrier = (data.invoiceCarrier || '').trim();
    if (carrier && !CARRIER_REGEX.test(carrier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '手機條碼載具格式錯誤（格式：/開頭共8碼）',
        path: ['invoiceCarrier'],
      });
    }

    const taxId = (data.taxId || '').trim();
    if (taxId && !TAX_ID_REGEX.test(taxId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '統一編號格式錯誤（須為8碼數字）',
        path: ['taxId'],
      });
    }
  });

export const validateField = (
  field: CheckoutFormField,
  input: CheckoutFormInput,
): string => {
  const result = checkoutSchema.safeParse(input);
  if (result.success) return '';
  const issue = result.error.issues.find((i) => i.path[0] === field);
  return issue ? issue.message : '';
};

export const validateCheckoutForm = (
  input: CheckoutFormInput,
): { success: true; data: z.infer<typeof checkoutSchema> } | { success: false; error: string; errors: Record<CheckoutFormField, string> } => {
  const result = checkoutSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<CheckoutFormField, string> = {
      customerPhone: '',
      customerNote: '',
      taxId: '',
      invoiceCarrier: '',
    };
    for (const issue of result.error.issues) {
      const field = issue.path[0] as CheckoutFormField;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    const firstIssue = result.error.issues[0];
    return { success: false, error: firstIssue?.message || '資料驗證失敗', errors };
  }
  return { success: true, data: result.data };
};
