<template>
  <div
    v-if="totalCount > 0"
    class="fixed bottom-3.5 left-4 right-4 h-14 bg-[#0f0f11] rounded-full flex items-center justify-between pl-4 pr-2 shadow-2xl z-50 border border-white/10"
  >
    <div class="flex items-center gap-3 cursor-pointer" @click="$emit('open-drawer')">
      <div class="relative">
        <van-icon name="shopping-cart" size="24" color="#fff" />
        <div class="absolute -top-2 -right-2 bg-[#ff4d2e] text-white text-[11px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
          {{ totalCount }}
        </div>
      </div>
      <div>
        <span class="text-lg font-black text-white">NT$ {{ totalAmount }}</span>
      </div>
    </div>

    <van-button
      type="default"
      round
      color="#ffffff"
      class="!text-[#0f0f11] !font-black !px-5 !h-9.5 shadow-sm"
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
