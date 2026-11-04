<template>
  <transition name="banner-fade">
    <div v-if="visible" class="fixed top-2.5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition-colors"
        :class="isDisconnected ? 'bg-[#0f0f11]/90 text-amber-300 backdrop-blur-sm' : 'bg-emerald-600 text-white'"
      >
        <span class="w-2 h-2 rounded-full" :class="isDisconnected ? 'bg-amber-400 animate-pulse' : 'bg-white'" />
        <span>{{ isDisconnected ? t('network.reconnecting') : t('network.restored') }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const status = ref<'connected' | 'disconnected'>('connected');
const visible = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const isDisconnected = computed(() => status.value === 'disconnected');

const onStatusChange = (e: Event) => {
  const detail = (e as CustomEvent<{ status: 'connected' | 'disconnected' }>).detail;
  if (hideTimer) clearTimeout(hideTimer);

  if (detail.status === 'disconnected') {
    status.value = 'disconnected';
    visible.value = true;
  } else if (detail.status === 'connected' && visible.value) {
    status.value = 'connected';
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
