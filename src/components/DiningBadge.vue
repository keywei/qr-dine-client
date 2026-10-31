<template>
  <van-tag
    :type="diningType === 'DINE_IN' ? 'danger' : 'warning'"
    :size="size"
    round
  >
    {{ diningType === 'DINE_IN' ? `內用桌號：${tableCode || '未指定'}` : '外帶自取模式' }}
  </van-tag>
</template>

<script setup lang="ts">
import type { DiningType } from '../types';

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
