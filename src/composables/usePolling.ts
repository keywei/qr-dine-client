import { onMounted, onUnmounted } from 'vue';

export const usePolling = (fn: () => void | Promise<void>, intervalMs = 5000) => {
  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    timer = setInterval(fn, intervalMs);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  const stop = () => {
    if (timer) clearInterval(timer);
  };

  return { stop };
};

