<template>
  <div class="mx-auto min-h-screen max-w-[540px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.05)] relative">
    <NetworkStatusBanner />
    <ServiceBellFloating :table-code="cartStore.tableCode" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NetworkStatusBanner from '@/components/NetworkStatusBanner.vue';
import ServiceBellFloating from '@/components/ServiceBellFloating.vue';
import { useCartStore } from '@/stores/cart';
import { initClientSocket } from '@/socket';

const cartStore = useCartStore();

onMounted(() => {
  initClientSocket();
});
</script>
