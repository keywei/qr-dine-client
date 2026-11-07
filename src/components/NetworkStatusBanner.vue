<template>
  <transition name="banner-fade">
    <div
      v-if="visible"
      class="pointer-events-none fixed left-1/2 top-2.5 z-[9999] -translate-x-1/2"
    >
      <div
        class="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-md transition-colors"
        :class="
          isDisconnected
            ? 'bg-[#0f0f11]/90 text-amber-300 backdrop-blur-sm'
            : 'bg-emerald-600 text-white'
        "
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="isDisconnected ? 'animate-pulse bg-amber-400' : 'bg-white'"
        />
        <span>{{ isDisconnected ? t('network.reconnecting') : t('network.restored') }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NetworkStatus, CustomSocketStatus } from '@/types/socket';

const { t } = useI18n();
const status = ref<NetworkStatus>('connected');
const visible = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const isDisconnected = computed(() => status.value === 'disconnected');
const onStatusChange = (e: CustomEvent<CustomSocketStatus>) => {
  const { status: newStatus } = e.detail;
  if (hideTimer) clearTimeout(hideTimer);
  status.value = newStatus;
  if (isDisconnected.value) visible.value = true;
  else if (visible.value) {
    hideTimer = setTimeout(() => {
      visible.value = false;
    }, 1800);
  }
};

onMounted(() => {
  window.addEventListener('socket:status', onStatusChange);
});

onUnmounted(() => {
  window.removeEventListener('socket:status', onStatusChange);
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
.banner-fade-enter-active,
.banner-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
