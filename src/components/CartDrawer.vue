<template>
  <van-popup :show="visible" position="bottom" round class="p-4 max-h-[70vh]" @update:show="$emit('update:visible', $event)">
    <div class="flex justify-between items-center pb-3 border-b border-slate-100">
      <span class="text-base font-bold text-slate-800">購物車清單 ({{ totalCount }}項)</span>
      <van-button size="mini" plain type="danger" @click="$emit('clear')">清空購物車</van-button>
    </div>

    <div class="max-h-[40vh] overflow-y-auto py-2.5 flex flex-col gap-3">
      <div v-for="item in items" :key="item.id" class="flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800">{{ item.name }}</span>
          <span v-if="item.optionsText" class="text-xs text-slate-500 mt-0.5">{{ item.optionsText }}</span>
          <span class="text-xs font-bold text-rose-600 mt-0.5">NT$ {{ item.price }}</span>
        </div>
        <van-stepper
          :model-value="item.quantity"
          min="0"
          theme="round"
          button-size="22"
          @change="(val: number) => $emit('update-qty', item.id, val)"
        />
      </div>
    </div>

    <div class="pt-3.5 border-t border-slate-100">
      <div class="flex justify-between items-baseline mb-3">
        <span class="text-sm text-slate-600">總計金額：</span>
        <span class="text-xl font-extrabold text-rose-600">NT$ {{ totalAmount }}</span>
      </div>
      <van-button
        type="primary"
        block
        round
        size="large"
        color="linear-gradient(to right, #0284c7, #0369a1)"
        @click="$emit('checkout')"
      >
        確認前往結帳
      </van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { CartItem } from '../types';

defineProps<{
  visible: boolean;
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'clear'): void;
  (e: 'checkout'): void;
  (e: 'update-qty', id: string, qty: number): void;
}>();
</script>
