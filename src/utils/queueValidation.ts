import { z } from 'zod';
import { PHONE_REGEX } from './validation';
import { type QueueValidateResult } from '@/types/queue';

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

export const validateQueueForm = (
  input: z.input<typeof queueSchema>,
): QueueValidateResult<z.infer<typeof queueSchema>> => {
  const result = queueSchema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error.issues[0]?.message ?? '資料驗證失敗' };
};
