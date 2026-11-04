// 模組化行動端縮放防護工具 (Mobile Prevent Zoom Helper)
export const setupPreventZoom = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. 禁用 iOS Safari 手勢雙指縮放 (Pinch-to-zoom)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // 2. 禁用多指觸控移動縮放
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // 3. 禁用 iOS Safari 快速雙擊空白處縮放 (Double-tap to zoom)
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 350) {
        const target = e.target as HTMLElement | null;
        const isInteractive =
          target &&
          (target.closest('button') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('.van-stepper') ||
            target.closest('.van-button'));
        if (!isInteractive) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    },
    { passive: false },
  );
};
