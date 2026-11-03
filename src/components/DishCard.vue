<template>
  <div class="bg-white rounded-xl p-3 flex gap-3 shadow-sm">
    <div class="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
      <DishImage :src="dish.imageUrl" :alt="dish.name" class="w-full h-full" />
      <div
        v-if="!dish.isAvailable"
        class="absolute inset-0 bg-black/55 text-white text-xs font-bold flex items-center justify-center"
      >
        {{ $t('dish.soldOut') }}
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <div>
        <h4 class="m-0 text-sm font-bold text-slate-800">{{ dish.name }}</h4>
        <p class="mt-1 mb-0 text-xs text-slate-500 line-clamp-2">
          {{ dish.description || $t('dish.defaultDescription') }}
        </p>
      </div>

      <div class="flex items-center justify-between mt-1.5">
        <span class="text-base font-black text-[#0f0f11]">NT$ {{ dish.price }}</span>

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
              {{ $t('dish.chooseSpecs') }}
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
          <span v-else class="text-xs text-slate-400">{{ $t('dish.unavailable') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types';
import DishImage from '@/components/DishImage.vue';

defineProps<{
  dish: MenuItem;
}>();

defineEmits<{
  (e: 'select-specs', dish: MenuItem): void;
  (e: 'add-to-cart', dish: MenuItem): void;
}>();
</script>
