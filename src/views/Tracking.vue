<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <van-nav-bar title="訂單進度追蹤" right-text="返回點餐" @click-right="router.push('/order')" />

    <div v-if="loading && !order" class="flex-1 flex items-center justify-center py-20">
      <van-loading type="spinner" color="#0284c7" vertical>載入訂單進度中...</van-loading>
    </div>

    <div v-else-if="order" class="flex-1 p-3.5 pb-20 flex flex-col gap-3.5 overflow-y-auto">
      <TrackingStatusCard :order="order" :paying="paying" @pay="onPay" />

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <span class="text-sm font-bold text-slate-800">訂單詳情</span>
          <span class="text-xs text-slate-500 font-mono">單號：{{ order.orderNo }}</span>
        </div>
        <OrderItemRow v-for="item in order.items" :key="item.id" :item="item" />
        <div v-if="order.customerNote" class="py-2 text-xs text-slate-500 border-t border-slate-50">
          <span class="font-bold">備註需求：</span>{{ order.customerNote }}
        </div>
        <div class="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
          <span class="text-sm font-semibold text-slate-600">總計金額</span>
          <span class="text-lg font-extrabold text-rose-600">NT$ {{ order.totalAmount }}</span>
        </div>
      </div>

      <van-button type="default" round block @click="router.push('/order')">回到菜單 / 再次加點</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';
import api from '@/api';
import { getClientSocket, joinOrderRoom, leaveOrderRoom } from '@/socket';
import { useOrderStatus } from '@/composables/useOrderStatus';
import TrackingStatusCard from '@/components/TrackingStatusCard.vue';
import OrderItemRow from '@/components/OrderItemRow.vue';

const route = useRoute();
const router = useRouter();
const { getStatusTitle } = useOrderStatus();

const order = ref<any>(null);
const loading = ref(false);
const paying = ref(false);
const orderNo = computed(() => String(route.params.orderNo));

const fetchOrder = async () => {
  loading.value = true;
  try {
    const res: any = await api.get(`/orders/track/${orderNo.value}`);
    if (res.success && res.data) order.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const onPay = async (channel: string) => {
  paying.value = true;
  try {
    const res: any = await api.post('/payments/mock-pay', { orderNo: orderNo.value, paymentChannel: channel });
    if (res.success && res.data) {
      order.value = res.data;
      showToast({ message: '付款成功！訂單已送至廚房', icon: 'success' });
    }
  } catch (e) {
    console.error(e);
  } finally {
    paying.value = false;
  }
};

onMounted(() => {
  fetchOrder();
  joinOrderRoom(orderNo.value);
  getClientSocket().on('order:updated', (updated: any) => {
    if (updated.orderNo === orderNo.value) {
      order.value = updated;
      showNotify({ type: 'success', message: `狀態更新：${getStatusTitle(updated.status, updated.paymentStatus)}` });
    }
  });
});

onUnmounted(() => {
  leaveOrderRoom(orderNo.value);
  getClientSocket().off('order:updated');
});
</script>
