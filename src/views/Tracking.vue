<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar :title="order ? getStatusTitle(order.status, order.paymentStatus) : $t('tracking.title')" :right-text="$t('tracking.backToOrder')" @click-right="router.push('/order')" />
    <div v-if="loading && !order" class="flex-1 flex items-center justify-center py-20">
      <van-loading type="spinner" color="#0284c7" vertical>{{ $t('tracking.loading') }}</van-loading>
    </div>
    <div v-else-if="order" class="flex-1 p-3.5 pb-20 flex flex-col gap-3.5 overflow-y-auto">
      <TrackingStatusCard :order="order" :paying="paying" @pay="onPay" />
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <span class="text-sm font-bold text-slate-800">{{ $t('tracking.orderDetail') }}</span>
          <span class="text-xs text-slate-500 font-mono">{{ $t('tracking.orderNoLabel') }}{{ order.orderNo }}</span>
        </div>
        <OrderItemRow v-for="item in order.items" :key="item.id" :item="item" />
        <div v-if="order.taxId" class="py-1.5 text-xs text-slate-500 border-t border-slate-50"><span class="font-bold">{{ $t('tracking.taxIdLabel') }}</span>{{ order.taxId }}</div>
        <div v-if="order.invoiceCarrier" class="py-1.5 text-xs text-slate-500 border-t border-slate-50"><span class="font-bold">{{ $t('tracking.carrierLabel') }}</span>{{ order.invoiceCarrier }}</div>
        <div v-if="order.customerNote" class="py-1.5 text-xs text-slate-500 border-t border-slate-50 whitespace-pre-wrap break-all"><span class="font-bold">{{ $t('tracking.noteLabel') }}</span>{{ order.customerNote }}</div>
        <div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
          <span class="text-sm font-semibold text-slate-600">{{ $t('tracking.totalAmount') }}</span>
          <span class="text-lg font-extrabold text-rose-600">NT$ {{ order.totalAmount }}</span>
        </div>
      </div>
      <van-button type="default" round block @click="router.push('/order')">{{ $t('tracking.backToMenu') }}</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';
import { useI18n } from 'vue-i18n';
import api from '@/api';
import { getClientSocket, joinOrderRoom, leaveOrderRoom } from '@/socket';
import { useOrderStatus } from '@/composables/useOrderStatus';
import { usePolling } from '@/composables/usePolling';
import TrackingStatusCard from '@/components/TrackingStatusCard.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';
import type { Order } from '@/types';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getStatusTitle } = useOrderStatus();
const order = ref<Order | null>(null);
const loading = ref(false);
const paying = ref(false);
const orderNo = computed(() => String(route.params.orderNo));

const fetchOrder = async () => {
  if (!order.value) loading.value = true;
  try {
    order.value = await api.get<Order>(`/orders/track/${orderNo.value}`);
  } finally {
    loading.value = false;
  }
};
usePolling(fetchOrder, 3000);

const onPay = async (channel: string) => {
  paying.value = true;
  try {
    order.value = await api.post<Order>('/payments/mock-pay', { orderNo: orderNo.value, paymentChannel: channel });
    showToast({ message: t('tracking.paySuccess'), icon: 'success' });
  } finally {
    paying.value = false;
  }
};

const handleOrderUpdate = (updated: Order) => {
  if (updated.orderNo === orderNo.value) {
    order.value = updated;
    showNotify({ type: 'success', message: t('tracking.statusUpdated', { status: getStatusTitle(updated.status, updated.paymentStatus) }) });
  }
};

onMounted(() => {
  fetchOrder();
  joinOrderRoom(orderNo.value);
  const s = getClientSocket();
  s.on('order:updated', handleOrderUpdate);
  s.on('order:status_changed', handleOrderUpdate);
});

onUnmounted(() => {
  leaveOrderRoom(orderNo.value);
  const s = getClientSocket();
  s.off('order:updated', handleOrderUpdate);
  s.off('order:status_changed', handleOrderUpdate);
});
</script>
