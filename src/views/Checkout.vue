<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar :title="$t('checkout.title')" :left-text="$t('checkout.backToMenu')" left-arrow @click-left="router.push('/order')" />
    <div class="flex-1 p-3.5 pb-24 flex flex-col gap-3.5 overflow-y-auto">
      <div class="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
        <span class="text-sm font-bold text-slate-800">{{ $t('checkout.diningType') }}</span>
        <DiningBadge :dining-type="cartStore.diningType" :table-code="cartStore.tableCode" size="large" />
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <span class="text-sm font-bold text-slate-800">{{ $t('checkout.orderDetail') }}</span>
          <span class="text-xs text-slate-500">{{ $t('checkout.itemCount', { count: cartStore.totalCount }) }}</span>
        </div>
        <OrderItemRow v-for="item in cartStore.items" :key="item.id" :item="item" />
        <div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
          <span class="text-sm font-semibold text-slate-600">{{ $t('checkout.subtotal') }}</span>
          <span class="text-base font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
        </div>
      </div>
      <van-cell-group inset class="!m-0 shadow-sm rounded-xl overflow-hidden">
        <van-field v-model="customerPhone" :label="$t('checkout.phoneLabel')" :placeholder="$t('checkout.phonePlaceholder')" type="tel" />
        <van-field v-model="customerNote" type="textarea" rows="2" autosize maxlength="100" show-word-limit :label="$t('checkout.noteLabel')" :placeholder="$t('checkout.notePlaceholder')" />
      </van-cell-group>
      <InvoiceForm v-model:tax-id="taxId" v-model:invoice-carrier="invoiceCarrier" />
    </div>
    <div class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 px-4 flex justify-between items-center shadow-lg z-40">
      <div>
        <span class="text-xs text-slate-500">{{ $t('checkout.payableAmount') }}</span>
        <span class="text-xl font-extrabold text-rose-600">NT$ {{ cartStore.totalAmount }}</span>
      </div>
      <van-button type="primary" round size="large" color="linear-gradient(to right, #e11d48, #be123c)" class="!w-44 !h-10.5 !font-bold" @click="onProceedPayment">
        {{ $t('checkout.confirmPaymentMethod') }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useCartStore } from '@/stores/cart';
import { validateCheckoutForm } from '@/utils/validation';
import DiningBadge from '@/components/DiningBadge.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';
import InvoiceForm from '@/components/InvoiceForm.vue';

const router = useRouter();
const cartStore = useCartStore();
const customerPhone = ref(cartStore.checkoutInfo.customerPhone || '');
const customerNote = ref(cartStore.checkoutInfo.customerNote || '');
const taxId = ref(cartStore.checkoutInfo.taxId || '');
const invoiceCarrier = ref(cartStore.checkoutInfo.invoiceCarrier || '');

const onProceedPayment = () => {
  if (cartStore.items.length === 0) return router.push('/order');
  const valid = validateCheckoutForm({
    diningType: cartStore.diningType,
    customerPhone: customerPhone.value,
    customerNote: customerNote.value,
    taxId: taxId.value,
    invoiceCarrier: invoiceCarrier.value,
  });
  if (!valid.success) return showToast(valid.error);

  cartStore.setCheckoutInfo({
    customerPhone: customerPhone.value.trim() || undefined,
    customerNote: customerNote.value.trim() || undefined,
    taxId: taxId.value.trim() || undefined,
    invoiceCarrier: invoiceCarrier.value.trim() || undefined,
  });
  router.push('/payment');
};
</script>
