import { ref, computed, onMounted, onUnmounted } from 'vue';
import { showToast, showNotify } from 'vant';
import type { ServiceCallRequest } from '@/types/service';
import { getServiceBellStatus, callServiceBell } from '../api/serviceBell';
import { getClientSocket } from '../socket';
import i18n from '../locales';

export const useServiceBellClient = (tableCodeGetter: () => string) => {
  const globalEnabled = ref(true);
  const tableEnabled = ref(true);
  const cooldownSeconds = ref(0);
  const calling = ref(false);
  const popupVisible = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  const isAvailable = computed(() => {
    return Boolean(tableCodeGetter()) && globalEnabled.value && tableEnabled.value;
  });

  const isCoolingDown = computed(() => cooldownSeconds.value > 0);

  const startCooldown = (sec: number) => {
    cooldownSeconds.value = sec;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (cooldownSeconds.value > 0) cooldownSeconds.value -= 1;
      else if (timer) clearInterval(timer);
    }, 1000);
  };

  const fetchStatus = async () => {
    const code = tableCodeGetter();
    if (!code) return;
    try {
      const res = await getServiceBellStatus(code);
      globalEnabled.value = res.globalEnabled;
      tableEnabled.value = res.tableEnabled;
      if (res.cooldownSeconds && res.cooldownSeconds > 0) startCooldown(res.cooldownSeconds);
    } catch {}
  };

  const onConfigChanged = (config: any) => {
    if (config?.globalEnabled !== undefined) globalEnabled.value = config.globalEnabled;
    const code = tableCodeGetter();
    if (config?.tableCode && config.tableCode === code && config.tableEnabled !== undefined) {
      tableEnabled.value = config.tableEnabled;
    }
  };

  const openBell = () => {
    if (!isAvailable.value) {
      showToast({ message: i18n.global.t('serviceBell.notAvailable'), icon: 'fail' });
      return;
    }
    popupVisible.value = true;
  };

  const submitCall = async (type: ServiceCallRequest['type'], note?: string) => {
    const code = tableCodeGetter();
    if (!code || isCoolingDown.value) return;
    calling.value = true;
    try {
      await callServiceBell({ tableCode: code, type, note });
      popupVisible.value = false;
      startCooldown(60);
      showNotify({ type: 'success', message: i18n.global.t('serviceBell.calledSuccess') });
    } catch (err: any) {
      const msg = err?.response?.data?.message || i18n.global.t('serviceBell.callFailed');
      showToast({ message: msg, icon: 'fail' });
    } finally {
      calling.value = false;
    }
  };

  onMounted(() => {
    fetchStatus();
    const s = getClientSocket();
    s.on('service_bell:config_changed', onConfigChanged);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
    const s = getClientSocket();
    s.off('service_bell:config_changed', onConfigChanged);
  });

  return { isAvailable, isCoolingDown, cooldownSeconds, calling, popupVisible, openBell, submitCall, fetchStatus };
};
