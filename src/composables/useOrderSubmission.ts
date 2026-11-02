import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useI18n } from 'vue-i18n';
import api from '@/api';
import { useCartStore } from '@/stores/cart';
import type { CreateOrderPayload } from '@/types';

export const useOrderSubmission = () => {
  const router = useRouter();
  const { t } = useI18n();
  const cartStore = useCartStore();
  const submitting = ref(false);

  const submitAndPay = async (method: 'CASH' | 'LINE_PAY' | 'CREDIT_CARD') => {
    if (cartStore.items.length === 0) return router.push('/order');
    submitting.value = true;
    try {
      const payload: CreateOrderPayload = {
        diningType: cartStore.diningType,
        tableCode: cartStore.diningType === 'DINE_IN' ? cartStore.tableCode : undefined,
        customerPhone: cartStore.checkoutInfo.customerPhone,
        customerNote: cartStore.checkoutInfo.customerNote,
        taxId: cartStore.checkoutInfo.taxId,
        invoiceCarrier: cartStore.checkoutInfo.invoiceCarrier,
        paymentMethod: method === 'CASH' ? 'CASH' : 'ONLINE',
        items: cartStore.items.map((it) => ({
          menuItemId: it.menuItemId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          optionsText: it.optionsText,
        })),
      };
      const res = await api.post<{ orderNo: string }>('/orders', payload);
      if (method !== 'CASH') {
        await api.post('/payments/mock-pay', { orderNo: res.orderNo, paymentChannel: method });
      }
      showToast({ message: t('checkout.orderCreated'), icon: 'success' });
      cartStore.clearCart();
      router.replace(`/tracking/${res.orderNo}`);
    } finally {
      submitting.value = false;
    }
  };

  return { submitting, submitAndPay };
};
