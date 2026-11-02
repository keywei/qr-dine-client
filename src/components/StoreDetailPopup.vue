<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    closeable
    :style="{ maxHeight: '70%' }"
    @update:show="$emit('update:visible', $event)"
  >
    <div class="p-5 pt-6 flex flex-col gap-4">
      <div class="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
        {{ $t('store.detailTitle') }}
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-start">
          <span class="text-slate-500 shrink-0 mr-4">{{ $t('store.name') }}</span>
          <span class="font-semibold text-slate-800 text-right">{{ store?.name || '-' }}</span>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-slate-500 shrink-0 mr-4">{{ $t('store.storeCode') }}</span>
          <span class="font-mono text-slate-800">{{ store?.storeCode || '-' }}</span>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-slate-500 shrink-0 mr-4">{{ $t('store.phone') }}</span>
          <a :href="`tel:${store?.phone}`" class="text-sky-600 font-medium">{{ store?.phone || '-' }}</a>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-slate-500 shrink-0 mr-4">{{ $t('store.businessHours') }}</span>
          <span class="text-slate-800 text-right">{{ store?.businessHours || '-' }}</span>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-slate-500 shrink-0 mr-4">{{ $t('store.address') }}</span>
          <span class="text-slate-800 text-right">{{ store?.address || '-' }}</span>
        </div>
      </div>

      <van-button round block type="primary" color="#0284c7" class="mt-2" @click="$emit('update:visible', false)">
        {{ $t('common.close') }}
      </van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { StoreSetting } from '@/types';

defineProps<{
  visible: boolean;
  store: StoreSetting | null;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>
