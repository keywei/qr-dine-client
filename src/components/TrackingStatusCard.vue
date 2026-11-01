<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex justify-between items-start gap-2.5 mb-3 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <span class="text-3xl shrink-0">{{ getStatusEmoji(order.status) }}</span>
        <div class="flex-1 min-w-0">
          <h3 class="m-0 text-base font-bold text-slate-800 truncate">{{ getStatusTitle(order.status, order.paymentStatus) }}</h3>
          <p class="m-0 mt-0.5 text-xs text-slate-500 leading-normal">{{ getStatusDesc(order.status, order.paymentStatus, order.paymentMethod) }}</p>
        </div>
      </div>
      <DiningBadge
        :dining-type="order.diningType"
        :table-code="order.table?.code || order.tableCode"
        class="shrink-0 mt-0.5"
      />
    </div>

    <van-steps :active="getStepIndex(order.status, order.paymentStatus)" active-color="#0284c7" class="py-2">
      <van-step>送出訂單</van-step>
      <van-step>{{ order.paymentStatus === 'PAID' ? '已付款' : '待付款' }}</van-step>
      <van-step>製作中</van-step>
      <van-step>已完成</van-step>
    </van-steps>

    <div v-if="order.paymentStatus === 'UNPAID' && order.paymentMethod === 'ONLINE'" class="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
      <p class="text-xs text-slate-600 m-0 mb-1">請點擊下方按鈕完成模擬付款：</p>
      <van-button type="primary" round block size="large" color="#06c755" :loading="paying" @click="$emit('pay', 'LINE_PAY')">
        🟢 LINE Pay 模擬支付 (NT$ {{ order.totalAmount }})
      </van-button>
      <van-button type="default" round block size="normal" :loading="paying" @click="$emit('pay', 'CREDIT_CARD')">
        💳 信用卡 模擬支付 (NT$ {{ order.totalAmount }})
      </van-button>
    </div>

    <van-notice-bar v-else-if="order.paymentStatus === 'UNPAID' && order.paymentMethod === 'CASH'" class="mt-3 rounded-lg" left-icon="info-o" text="請至櫃檯出示單號結帳，店員收款後將立即製作！" wrapable :scrollable="false" />
  </div>
</template>

<script setup lang="ts">
import { useOrderStatus } from '@/composables/useOrderStatus';
import DiningBadge from '@/components/DiningBadge.vue';
import type { Order } from '@/types';

defineProps<{
  order: Order;
  paying: boolean;
}>();

defineEmits<{
  (e: 'pay', channel: string): void;
}>();

const { getStatusEmoji, getStatusTitle, getStatusDesc, getStepIndex } = useOrderStatus();
</script>
