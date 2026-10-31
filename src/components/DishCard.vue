<template>
  <div class="bg-white rounded-xl p-3 flex gap-3 shadow-sm">
    <div class="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
      <img :src="dish.imageUrl || defaultImg" class="w-full h-full object-cover" />
      <div
        v-if="!dish.isAvailable"
        class="absolute inset-0 bg-black/55 text-white text-xs font-bold flex items-center justify-center"
      >
        已估清
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <div>
        <h4 class="m-0 text-sm font-bold text-slate-800">{{ dish.name }}</h4>
        <p class="mt-1 mb-0 text-xs text-slate-500 line-clamp-2">
          {{ dish.description || '特選食材精心製作' }}
        </p>
      </div>

      <div class="flex items-center justify-between mt-1.5">
        <span class="text-base font-extrabold text-rose-600">NT$ {{ dish.price }}</span>

        <div>
          <template v-if="dish.isAvailable">
            <van-button
              v-if="dish.options && dish.options.length > 0"
              size="mini"
              type="primary"
              round
              class="!h-6 !px-2.5"
              @click="$emit('select-specs', dish)"
            >
              選規格
            </van-button>
            <van-button
              v-else
              size="mini"
              icon="plus"
              type="primary"
              round
              class="!w-6 !h-6"
              @click="$emit('add-to-cart', dish)"
            />
          </template>
          <span v-else class="text-xs text-slate-400">暫停供應</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types';

defineProps<{
  dish: MenuItem;
}>();

defineEmits<{
  (e: 'select-specs', dish: MenuItem): void;
  (e: 'add-to-cart', dish: MenuItem): void;
}>();

const defaultImg =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60';
</script>
