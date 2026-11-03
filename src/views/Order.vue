<template>
  <div class="h-screen flex flex-col bg-slate-50 overflow-hidden">
    <StoreHeader
      :store="store"
      :dining-type="cartStore.diningType"
      :table-code="cartStore.tableCode"
      @open-detail="storeDetailVisible = true"
    />
    <van-search v-model="searchQuery" :placeholder="$t('order.searchPlaceholder')" shape="round" />
    <van-tabs
      v-model:active="selectedCatId"
      shrink
      color="#607234"
      line-width="20px"
      line-height="3px"
      @change="onCatChange"
    >
      <van-tab
        :name="0"
        :title="$t('order.allCategories')"
        :badge="cartStore.totalCount || undefined"
      />
      <van-tab
        v-for="c in categories"
        :key="c.id"
        :name="c.id"
        :title="c.name"
        :badge="cartStore.categoryCounts[c.id] || undefined"
      />
    </van-tabs>
    <div ref="scrollRef" class="flex-1 p-3.5 pb-24 overflow-y-auto">
      <van-empty
        v-if="filteredCats.length === 0"
        :description="$t('order.noDishes')"
        image="search"
        class="py-10"
      />
      <div v-for="cat in filteredCats" :key="cat.id" class="mb-5">
        <div class="text-[15px] font-bold text-slate-700 mb-2.5 pl-2 border-l-[3px] border-[#607234]">
          {{ cat.name }}
        </div>
        <div class="flex flex-col gap-3">
          <DishCard
            v-for="dish in cat.items"
            :key="dish.id"
            :dish="dish"
            @select-specs="onOpenSpecs"
            @add-to-cart="onDirectAdd"
          />
        </div>
      </div>
    </div>
    <DishSpecsPopup
      v-model:visible="specsVisible"
      v-model:quantity="selectedQuantity"
      :dish="currentDish"
      :unit-price="currentUnitPrice"
      :is-option-selected="isOptionSelected"
      :toggle-option="toggleOption"
      @confirm="onConfirmSpecs"
    />
    <CartBar
      :total-count="cartStore.totalCount"
      :total-amount="cartStore.totalAmount"
      @open-drawer="drawerVisible = true"
      @checkout="onCheckout"
    />
    <CartDrawer
      v-model:visible="drawerVisible"
      :items="cartStore.items"
      :total-count="cartStore.totalCount"
      :total-amount="cartStore.totalAmount"
      @clear="onClearCart"
      @checkout="onCheckout"
      @update-qty="(id, qty) => cartStore.updateQuantity(id, qty)"
    />
    <StoreDetailPopup v-model:visible="storeDetailVisible" :store="store" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useDishSpecs } from '@/composables/useDishSpecs';
import { useMenuCategories } from '@/composables/useMenuCategories';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { useOrderInteraction } from '@/composables/useOrderInteraction';
import { useMenuSync } from '@/composables/useMenuSync';
import StoreHeader from '@/components/StoreHeader.vue';
import StoreDetailPopup from '@/components/StoreDetailPopup.vue';
import DishCard from '@/components/DishCard.vue';
import DishSpecsPopup from '@/components/DishSpecsPopup.vue';
import CartBar from '@/components/CartBar.vue';
import CartDrawer from '@/components/CartDrawer.vue';

const route = useRoute();
const cartStore = useCartStore();
const { store, fetchStoreInfo } = useStoreInfo();
const { categories, selectedCatId, searchQuery, filteredCats, fetchMenu } = useMenuCategories();
const dishSpecs = useDishSpecs();
const { currentDish, selectedQuantity, currentUnitPrice, isOptionSelected, toggleOption } =
  dishSpecs;
const {
  specsVisible,
  drawerVisible,
  storeDetailVisible,
  onOpenSpecs,
  onDirectAdd,
  onConfirmSpecs,
  onClearCart,
  onCheckout,
} = useOrderInteraction(dishSpecs);
useMenuSync(fetchMenu);

const scrollRef = ref<HTMLElement | null>(null);
const onCatChange = () => {
  if (scrollRef.value) scrollRef.value.scrollTop = 0;
};

onMounted(() => {
  const isTakeout = String(route.query.diningType || '').toUpperCase() === 'TAKEOUT';
  const tableCode = isTakeout
    ? ''
    : String(route.query.tableId || route.query.tableCode || '') || 'A1';
  cartStore.setDiningInfo(isTakeout ? 'TAKEOUT' : 'DINE_IN', tableCode);
  fetchMenu();
  fetchStoreInfo();
});
</script>
