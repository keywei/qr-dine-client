<template>
  <div class="flex justify-between items-center py-2 border-b border-slate-50 last:border-none">
    <div class="flex-1 pr-2">
      <div class="text-sm font-semibold text-slate-800">{{ item.name }}</div>
      <div v-if="item.optionsText" class="text-xs text-slate-500 mt-0.5">
        {{ item.optionsText }}
      </div>
    </div>
    <div class="text-xs text-slate-500 font-medium px-3">x {{ item.quantity }}</div>
    <div class="text-sm font-bold text-slate-800 text-right min-w-[70px]">
      NT$ {{ item.price * item.quantity }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderItem, CartItem } from '@/types';

defineProps<{
  item: OrderItem | CartItem;
}>();
</script>
