import { ref, onMounted, onUnmounted } from 'vue';
import { showToast, showNotify, showConfirmDialog } from 'vant';
import { useI18n } from 'vue-i18n';
import api from '@/api';
import { getClientSocket } from '@/socket';
import { usePolling } from '@/composables/usePolling';
import type { QueueTicket, QueueStatusResponse } from '@/types';

const STORAGE_KEY = 'queue_ticket';
const getStoredTicket = (): QueueTicket | null => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export const useQueue = () => {
  const { t } = useI18n();
  const ticket = ref<QueueTicket | null>(getStoredTicket());
  const currentCallingNo = ref<number | null>(null);
  const waitingCount = ref<number>(0);
  const loading = ref(false);
  const submitting = ref(false);

  const saveTicket = (tkt: QueueTicket | null) => {
    ticket.value = tkt;
    if (typeof localStorage === 'undefined') return;
    tkt ? localStorage.setItem(STORAGE_KEY, JSON.stringify(tkt)) : localStorage.removeItem(STORAGE_KEY);
  };

  const fetchStatus = async () => {
    try {
      const url = ticket.value ? `/queue/${ticket.value.id}` : '/queue/status';
      const res = await api.get<QueueStatusResponse>(url);
      if (res?.ticket) saveTicket(res.ticket);
      currentCallingNo.value = res?.currentCallingNo ?? null;
      waitingCount.value = res?.waitingCount ?? 0;
    } catch {
      // 容錯
    }
  };

  const takeTicket = async (customerPhone: string, partySize: number) => {
    submitting.value = true;
    try {
      const res = await api.post<QueueTicket>('/queue', { customerPhone, partySize });
      saveTicket(res);
      showToast({ message: t('queue.ticketCreated', { no: res.ticketNo }), icon: 'success' });
      await fetchStatus();
    } finally {
      submitting.value = false;
    }
  };

  const cancelTicket = () => {
    if (!ticket.value) return;
    showConfirmDialog({
      title: t('queue.cancelConfirmTitle'),
      message: t('queue.cancelConfirmMsg'),
    }).then(async () => {
      if (!ticket.value) return;
      await api.post(`/queue/${ticket.value.id}/cancel`);
      saveTicket(null);
      showToast({ message: t('queue.cancelSuccess'), icon: 'success' });
    });
  };

  usePolling(fetchStatus, 3000);

  const onQueueCalled = (called: QueueTicket) => {
    if (ticket.value && (called.id === ticket.value.id || called.ticketNo === ticket.value.ticketNo)) {
      saveTicket(called);
      showNotify({ type: 'warning', message: t('queue.calledAlert', { no: called.ticketNo }), duration: 6000 });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  };

  onMounted(() => {
    fetchStatus();
    const s = getClientSocket();
    s.on('queue:updated', fetchStatus);
    s.on('queue:called', onQueueCalled);
  });

  onUnmounted(() => {
    const s = getClientSocket();
    s.off('queue:updated', fetchStatus);
    s.off('queue:called', onQueueCalled);
  });

  return { ticket, currentCallingNo, waitingCount, loading, submitting, takeTicket, cancelTicket, fetchStatus };
};
