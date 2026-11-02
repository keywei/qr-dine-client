<template>
  <div class="bg-white px-4 pt-3 pb-2 shadow-sm shrink-0">
    <div class="flex justify-between items-start mb-1.5">
      <div class="flex-1 min-w-0 mr-3">
        <div class="flex items-center gap-2">
          <h2 class="m-0 text-base font-extrabold text-slate-900 truncate">
            {{ store?.name || $t('order.title') }}
          </h2>
          <van-button
            size="mini"
            round
            plain
            type="primary"
            class="!text-xs shrink-0"
            @click="$emit('open-detail')"
          >
            {{ $t('store.viewDetail') }}
          </van-button>
        </div>
        <p class="m-0 mt-0.5 text-xs text-slate-400 truncate">
          {{ store?.address || '' }}
        </p>
      </div>
      <DiningBadge :dining-type="diningType" :table-code="tableCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiningType, StoreSetting } from '@/types';
import DiningBadge from '@/components/DiningBadge.vue';

defineProps<{
  store: StoreSetting | null;
  diningType: DiningType;
  tableCode?: string;
}>();

defineEmits<{
  (e: 'open-detail'): void;
}>();
</script>
