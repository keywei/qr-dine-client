<template>
  <van-tag
    :type="diningType === 'DINE_IN' ? 'danger' : 'warning'"
    :size="size"
    round
    class="whitespace-nowrap shrink-0 !inline-flex items-center"
  >
    {{ diningType === 'DINE_IN' ? $t('dining.dineIn', { code: tableCode || $t('dining.unassigned') }) : $t('dining.takeout') }}
  </van-tag>
</template>

<script setup lang="ts">
import type { DiningType } from '@/types';

withDefaults(
  defineProps<{
    diningType: DiningType;
    tableCode?: string;
    size?: 'large' | 'medium';
  }>(),
  {
    size: 'medium',
  }
);
</script>
