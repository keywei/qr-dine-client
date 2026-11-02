import { onMounted, onUnmounted } from 'vue';
import { showDialog, showNotify } from 'vant';
import { useI18n } from 'vue-i18n';
import { getClientSocket } from '@/socket';
import { useCartStore } from '@/stores/cart';
import type { MenuItemUpdatedPayload } from '@/types';

export const handleMenuUpdateNotification = (
  payload: MenuItemUpdatedPayload,
  cartStore: ReturnType<typeof useCartStore>,
  t: (key: string, values?: Record<string, unknown>) => string,
) => {
  const affected = cartStore.items.filter((it) => it.menuItemId === payload.id);
  if (affected.length === 0) return { affected: false, removed: false, priceUpdated: false };

  const isUnavailable = !payload.isAvailable || payload.action === 'deleted';
  if (isUnavailable) {
    cartStore.removeByMenuItemId(payload.id);
    showDialog({
      title: t('cart.dishUnavailableTitle'),
      message: t('cart.dishUnavailableNotice', { name: payload.name }),
    });
    return { affected: true, removed: true, priceUpdated: false };
  }

  const priceChanged = affected.some((it) => it.basePrice !== payload.price || it.name !== payload.name);
  if (priceChanged) {
    cartStore.updateItemInfo(payload.id, payload.price, payload.name);
    showNotify({
      type: 'warning',
      message: t('cart.dishPriceUpdatedNotice', { name: payload.name }),
    });
    return { affected: true, removed: false, priceUpdated: true };
  }

  return { affected: true, removed: false, priceUpdated: false };
};

export const useMenuSync = (onMenuRefresh?: () => void) => {
  const { t } = useI18n();
  const cartStore = useCartStore();

  const onMenuItemUpdated = (payload: MenuItemUpdatedPayload) => {
    if (onMenuRefresh) onMenuRefresh();
    handleMenuUpdateNotification(payload, cartStore, t);
  };

  onMounted(() => {
    getClientSocket().on('menu:item_updated', onMenuItemUpdated);
  });

  onUnmounted(() => {
    getClientSocket().off('menu:item_updated', onMenuItemUpdated);
  });

  return { onMenuItemUpdated };
};
