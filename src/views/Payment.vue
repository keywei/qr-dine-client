<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar :title="$t('payment.title')" :left-text="$t('payment.backToCheckout')" left-arrow @click-left="router.push('/checkout')" />
    <div class="flex-1 p-3.5 pb-12 flex flex-col gap-3.5 overflow-y-auto">
      <div class="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
        <span class="text-sm font-bold text-slate-800">{{ $t('checkout.diningType') }}</span>
        <DiningBadge :dining-type="cartStore.diningType" :table-code="cartStore.tableCode" size="large" />
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <span class="text-sm font-bold text-slate-800">{{ $t('payment.orderSummary') }}</span>
          <span class="text-xs text-slate-500">{{ $t('checkout.itemCount', { count: cartStore.totalCount }) }}</span>
        </div>
        <OrderItemRow v-for="item in cartStore.items" :key="item.id" :item="item" />
        <div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
          <span class="text-sm font-semibold text-slate-600">{{ $t('payment.subtotal') }}</span>
          <span class="text-base font-extrabold text-[#d95338]">NT$ {{ cartStore.totalAmount }}</span>
        </div>
      </div>

      <div v-if="hasCustomerInfo" class="bg-white rounded-xl p-4 shadow-sm space-y-1.5 text-xs text-slate-500">
        <div class="text-sm font-bold text-slate-800 pb-1 border-b border-slate-100">{{ $t('payment.customerInfo') }}</div>
        <div v-if="info.customerPhone"><span class="font-bold">{{ $t('checkout.phoneLabel') }}：</span>{{ info.customerPhone }}</div>
        <div v-if="info.taxId"><span class="font-bold">{{ $t('tracking.taxIdLabel') }}</span>{{ info.taxId }}</div>
        <div v-if="info.invoiceCarrier"><span class="font-bold">{{ $t('tracking.carrierLabel') }}</span>{{ info.invoiceCarrier }}</div>
        <div v-if="info.customerNote" class="whitespace-pre-wrap break-all"><span class="font-bold">{{ $t('tracking.noteLabel') }}</span>{{ info.customerNote }}</div>
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="text-sm font-bold text-slate-800 px-1">{{ $t('payment.selectPrompt') }}</div>
        <PaymentMethodCard
          :title="$t('payment.cashTitle')" :subtitle="$t('payment.cashSubtitle')" icon="💵" badge-class="bg-amber-100 text-amber-700"
          :action-text="$t('payment.cashAction')" :loading="activeMethod === 'CASH' && submitting" :disabled="submitting" @click="onSelect('CASH')"
        />
        <PaymentMethodCard
          :title="$t('payment.linePayTitle')" :subtitle="$t('payment.linePaySubtitle')" icon="🟢" badge-class="bg-emerald-100 text-emerald-700"
          :action-text="$t('payment.amountAction', { amount: cartStore.totalAmount })" :loading="activeMethod === 'LINE_PAY' && submitting" :disabled="submitting" @click="onSelect('LINE_PAY')"
        />
        <PaymentMethodCard
          :title="$t('payment.creditCardTitle')" :subtitle="$t('payment.creditCardSubtitle')" icon="💳" badge-class="bg-blue-100 text-blue-700"
          :action-text="$t('payment.amountAction', { amount: cartStore.totalAmount })" :loading="activeMethod === 'CREDIT_CARD' && submitting" :disabled="submitting" @click="onSelect('CREDIT_CARD')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useOrderSubmission } from '@/composables/useOrderSubmission';
import DiningBadge from '@/components/DiningBadge.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';
import PaymentMethodCard from '@/components/PaymentMethodCard.vue';

const router = useRouter();
const cartStore = useCartStore();
const { submitting, submitAndPay } = useOrderSubmission();
const activeMethod = ref<'CASH' | 'LINE_PAY' | 'CREDIT_CARD' | null>(null);

const info = computed(() => cartStore.checkoutInfo);
const hasCustomerInfo = computed(() => !!(info.value.customerPhone || info.value.taxId || info.value.invoiceCarrier || info.value.customerNote));

const onSelect = (method: 'CASH' | 'LINE_PAY' | 'CREDIT_CARD') => {
  activeMethod.value = method;
  submitAndPay(method);
};
</script>
