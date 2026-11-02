import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '@/stores/cart';
import type { MenuItem } from '@/types';
import type { useDishSpecs } from '@/composables/useDishSpecs';

export const useOrderInteraction = (dishSpecs: ReturnType<typeof useDishSpecs>) => {
  const router = useRouter();
  const { t } = useI18n();
  const cartStore = useCartStore();

  const specsVisible = ref(false);
  const drawerVisible = ref(false);
  const storeDetailVisible = ref(false);

  const onOpenSpecs = (dish: MenuItem) => {
    dishSpecs.openSpecs(dish);
    specsVisible.value = true;
  };

  const onDirectAdd = (dish: MenuItem) => {
    cartStore.addItem(dish, 1, '', dish.price);
    showToast({ message: t('order.addedToCart'), icon: 'success' });
  };

  const onConfirmSpecs = () => {
    const err = dishSpecs.validateRequired();
    if (err) return showToast(err);
    if (dishSpecs.currentDish.value) {
      cartStore.addItem(
        dishSpecs.currentDish.value,
        dishSpecs.selectedQuantity.value,
        dishSpecs.getSpecsText(),
        dishSpecs.currentUnitPrice.value,
      );
      specsVisible.value = false;
      showToast({ message: t('order.addedToCart'), icon: 'success' });
    }
  };

  const onClearCart = () =>
    showConfirmDialog({ title: t('common.dialogTitle'), message: t('cart.clearConfirm') }).then(
      () => {
        cartStore.clearCart();
        drawerVisible.value = false;
      },
    );

  const onCheckout = () => {
    drawerVisible.value = false;
    router.push('/checkout');
  };

  return {
    specsVisible,
    drawerVisible,
    storeDetailVisible,
    onOpenSpecs,
    onDirectAdd,
    onConfirmSpecs,
    onClearCart,
    onCheckout,
  };
};
