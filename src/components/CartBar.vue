<template>
  <div
    v-if="totalCount > 0"
    class="fixed bottom-3.5 left-4 right-4 h-14 bg-slate-900 rounded-full flex items-center justify-between pl-4 pr-2 shadow-xl z-50"
  >
    <div class="flex items-center gap-3 cursor-pointer" @click="$emit('open-drawer')">
      <div class="relative">
        <van-icon name="shopping-cart" size="24" color="#fff" />
        <div class="absolute -top-2 -right-2 bg-[#d95338] text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">
          {{ totalCount }}
        </div>
      </div>
      <div>
        <span class="text-lg font-extrabold text-white">NT$ {{ totalAmount }}</span>
      </div>
    </div>

    <van-button
      type="primary"
      round
      class="!font-bold !px-5 !h-9.5"
      @click="$emit('checkout')"
    >
      {{ $t('cart.checkout') }}
    </van-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalCount: number;
  totalAmount: number;
}>();

defineEmits<{
  (e: 'open-drawer'): void;
  (e: 'checkout'): void;
}>();
</script>
