<template>
  <van-popup :show="visible" position="bottom" round class="max-h-[80%] rounded-t-2xl" @update:show="$emit('update:visible', $event)">
    <div v-if="dish" class="p-4 flex flex-col max-h-[75vh]">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100 relative">
        <DishImage :src="dish.imageUrl" :alt="dish.name" class="w-16 h-16 rounded-lg" />
        <div>
          <h3 class="m-0 text-base font-bold">{{ dish.name }}</h3>
          <div class="text-lg font-extrabold text-emerald-600 mt-1">NT$ {{ unitPrice }}</div>
        </div>
        <van-icon name="cross" class="absolute top-0 right-0 text-xl text-slate-400 cursor-pointer" @click="$emit('update:visible', false)" />
      </div>

      <div class="flex-1 overflow-y-auto py-3 flex flex-col gap-4">
        <div v-for="grp in dish.options" :key="grp.id">
          <div class="text-sm font-bold text-slate-800 mb-2">
            {{ grp.title }}
            <span v-if="grp.isRequired" class="text-rose-500 text-xs ml-1">{{ $t('specs.required') }}</span>
            <span class="text-slate-400 text-xs font-normal ml-1">({{ grp.type === 'SINGLE' ? $t('specs.single') : $t('specs.multiple') }})</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="opt in grp.options"
              :key="opt.id"
              class="px-3.5 py-1.5 rounded-full text-xs cursor-pointer border flex items-center gap-1 transition-colors"
              :class="isOptionSelected(grp.id, opt.name) ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold' : 'bg-slate-100 border-slate-200 text-slate-700'"
              @click="toggleOption(grp, opt)"
            >
              <span>{{ opt.name }}</span>
              <span v-if="opt.extraPrice > 0" class="text-emerald-600 text-[11px]">+NT${{ opt.extraPrice }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100">
        <div class="flex justify-between items-center mb-3 text-sm font-semibold">
          <span>{{ $t('specs.quantity') }}</span>
          <van-stepper :model-value="quantity" min="1" max="99" theme="round" button-size="24" @update:model-value="$emit('update:quantity', $event)" />
        </div>
        <van-button
          type="primary"
          block
          round
          size="large"
          color="linear-gradient(to right, #22c55e, #16a34a)"
          @click="$emit('confirm')"
        >
          {{ $t('specs.addToCartWithPrice', { price: unitPrice * quantity }) }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { MenuItem, MenuItemOptionGroup, MenuItemOption } from '@/types';
import DishImage from '@/components/DishImage.vue';

defineProps<{
  visible: boolean;
  dish: MenuItem | null;
  quantity: number;
  unitPrice: number;
  isOptionSelected: (grpId: number, optName: string) => boolean;
  toggleOption: (grp: MenuItemOptionGroup, opt: MenuItemOption) => void;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'update:quantity', val: number): void;
  (e: 'confirm'): void;
}>();
</script>
