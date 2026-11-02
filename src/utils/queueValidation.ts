import { z } from 'zod';
import { PHONE_REGEX } from './validation';

export const queueSchema = z.object({
  customerPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, '請輸入正確的台灣手機號碼（格式：09xxxxxxxx）'),
  partySize: z
    .number()
    .int('用餐人數須為整數')
    .min(1, '用餐人數至少 1 位')
    .max(10, '用餐人數最多 10 位'),
});

export const validateQueueForm = (input: {
  customerPhone: string;
  partySize: number;
}): { success: true; data: z.infer<typeof queueSchema> } | { success: false; error: string } => {
  const result = queueSchema.safeParse(input);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return { success: false, error: firstIssue?.message || '資料驗證失敗' };
  }
  return { success: true, data: result.data };
};
