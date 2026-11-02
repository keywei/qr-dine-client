<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 flex justify-between">
      <span>{{ $t('payment.title') }}</span>
      <span class="text-xs text-slate-400 font-normal">{{ $t('payment.subtitle') }}</span>
    </div>
    <van-radio-group :model-value="modelValue" class="flex flex-col gap-2.5" @update:model-value="$emit('update:modelValue', $event)">
      <div
        v-for="opt in paymentOptions"
        :key="opt.value"
        class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
        :class="modelValue === opt.value ? 'bg-sky-50/60 border-sky-600' : 'border-slate-200'"
        @click="$emit('update:modelValue', opt.value)"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-xl">{{ opt.icon }}</span>
          <div>
            <div class="text-sm font-bold text-slate-800">{{ $t(opt.titleKey) }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ $t(opt.descKey) }}</div>
          </div>
        </div>
        <van-radio :name="opt.value" />
      </div>
    </van-radio-group>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '@/types';

defineProps<{
  modelValue: PaymentMethod;
}>();

defineEmits<{
  (e: 'update:modelValue', val: PaymentMethod): void;
}>();

const paymentOptions = [
  { value: 'ONLINE', icon: '💳', titleKey: 'payment.onlineTitle', descKey: 'payment.onlineDesc' },
  { value: 'CASH', icon: '💵', titleKey: 'payment.cashTitle', descKey: 'payment.cashDesc' },
] as const;
</script>
