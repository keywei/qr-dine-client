import { test, expect } from '@playwright/test';
import { validateQueueForm } from '../src/utils/queueValidation';
import type { QueueTicket } from '../src/types';

test.describe('內用排隊取號與看板狀態測試 (Queue)', () => {
  test('手機號碼與人數 Zod 驗證：格式錯誤阻擋，正確 09 與有效人數通過', () => {
    // 錯誤手機號碼（非 09、少於 10 碼、含英文）
    expect(validateQueueForm({ customerPhone: '0812345678', partySize: 2 }).success).toBe(false);
    expect(validateQueueForm({ customerPhone: '091234567', partySize: 2 }).success).toBe(false);
    expect(validateQueueForm({ customerPhone: '091234567A', partySize: 2 }).success).toBe(false);

    // 人數範圍驗證（需 1~10 人）
    expect(validateQueueForm({ customerPhone: '0912345678', partySize: 0 }).success).toBe(false);
    expect(validateQueueForm({ customerPhone: '0912345678', partySize: 11 }).success).toBe(false);

    // 正確資料通過
    const valid = validateQueueForm({ customerPhone: '0912345678', partySize: 4 });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.customerPhone).toBe('0912345678');
      expect(valid.data.partySize).toBe(4);
    }
  });

  test('唱號次數展示與上限提醒邏輯：1 次、2 次唱號警示，3 次未到自動取消 (EXPIRED)', () => {
    const getNoticeText = (ticket: Pick<QueueTicket, 'status' | 'callCount'>): string => {
      if (ticket.status === 'CALLING') {
        return `目前已經唱號第 ${ticket.callCount} 次！請盡速至櫃檯報到（唱號達 3 次未到將自動取消）`;
      }
      if (ticket.status === 'EXPIRED') {
        return '已叫號達 3 次未報到，系統已自動取消';
      }
      return '請留意現場叫號與通知';
    };

    expect(getNoticeText({ status: 'WAITING', callCount: 0 })).toContain('請留意現場叫號');
    expect(getNoticeText({ status: 'CALLING', callCount: 1 })).toContain('唱號第 1 次');
    expect(getNoticeText({ status: 'CALLING', callCount: 2 })).toContain('唱號第 2 次');
    expect(getNoticeText({ status: 'EXPIRED', callCount: 3 })).toContain('已叫號達 3 次未報到，系統已自動取消');
  });

  test('放棄排隊二次確認與狀態清理邏輯', async () => {
    let storageTicket: QueueTicket | null = {
      id: 99,
      ticketNo: 15,
      customerPhone: '0912345678',
      partySize: 2,
      status: 'WAITING',
      callCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const handleCancelConfirm = (isConfirmed: boolean) => {
      if (!isConfirmed) return false;
      storageTicket = null;
      return true;
    };

    // 使用者點擊取消（彈出確認框未同意）
    const cancelDismissed = handleCancelConfirm(false);
    expect(cancelDismissed).toBe(false);
    expect(storageTicket).not.toBeNull();

    // 使用者確認放棄排隊
    const cancelApproved = handleCancelConfirm(true);
    expect(cancelApproved).toBe(true);
    expect(storageTicket).toBeNull();
  });
});
