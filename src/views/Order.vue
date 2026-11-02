<template>
  <div class="h-screen flex flex-col bg-slate-50 overflow-hidden">
    <div class="bg-white px-4 pt-3 pb-1 shadow-sm shrink-0">
      <div class="flex justify-between items-center mb-1.5">
        <h2 class="m-0 text-lg font-extrabold text-slate-900">{{ $t('order.title') }}</h2>
        <DiningBadge :dining-type="cartStore.diningType" :table-code="cartStore.tableCode" />
      </div>
      <van-search v-model="searchQuery" :placeholder="$t('order.searchPlaceholder')" shape="round" />
    </div>

    <div class="bg-white border-b border-slate-100 z-10 shrink-0">
      <van-tabs v-model:active="selectedCatId" shrink color="#0284c7" line-width="20px" line-height="3px" @change="onCatChange">
        <van-tab :name="0" :title="$t('order.allCategories')" :badge="cartStore.totalCount || undefined" />
        <van-tab v-for="c in categories" :key="c.id" :name="c.id" :title="c.name" :badge="getCatBadge(c.id)" />
      </van-tabs>
    </div>

    <div ref="scrollRef" class="flex-1 p-3.5 pb-24 overflow-y-auto">
      <van-empty v-if="filteredCats.length === 0" :description="$t('order.noDishes')" image="search" class="py-10" />
      <div v-for="cat in filteredCats" :key="cat.id" class="mb-5">
        <div class="text-[15px] font-bold text-slate-700 mb-2.5 pl-2 border-l-[3px] border-sky-600">{{ cat.name }}</div>
        <div class="flex flex-col gap-3">
          <DishCard v-for="dish in cat.items" :key="dish.id" :dish="dish" @select-specs="onOpenSpecs" @add-to-cart="onDirectAdd" />
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
    <CartBar :total-count="cartStore.totalCount" :total-amount="cartStore.totalAmount" @open-drawer="drawerVisible = true" @checkout="onCheckout" />
    <CartDrawer
      v-model:visible="drawerVisible"
      :items="cartStore.items"
      :total-count="cartStore.totalCount"
      :total-amount="cartStore.totalAmount"
      @clear="onClearCart"
      @checkout="onCheckout"
      @update-qty="(id, qty) => cartStore.updateQuantity(id, qty)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '@/stores/cart';
import type { MenuItem } from '@/types';
import { useDishSpecs } from '@/composables/useDishSpecs';
import { useMenuCategories } from '@/composables/useMenuCategories';
import DiningBadge from '@/components/DiningBadge.vue';
import DishCard from '@/components/DishCard.vue';
import DishSpecsPopup from '@/components/DishSpecsPopup.vue';
import CartBar from '@/components/CartBar.vue';
import CartDrawer from '@/components/CartDrawer.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const cartStore = useCartStore();
const { categories, selectedCatId, searchQuery, filteredCats, fetchMenu } = useMenuCategories();
const { currentDish, selectedQuantity, currentUnitPrice, openSpecs, isOptionSelected, toggleOption, validateRequired, getSpecsText } = useDishSpecs();

const specsVisible = ref(false);
const drawerVisible = ref(false);
const scrollRef = ref<HTMLElement | null>(null);

const getCatBadge = (id: number) => {
  const cat = categories.value.find((c) => c.id === id);
  if (!cat) return undefined;
  const count = cartStore.items.filter((it) => cat.items.some((d) => d.id === it.menuItemId)).reduce((s, it) => s + it.quantity, 0);
  return count > 0 ? count : undefined;
};

const onCatChange = () => { if (scrollRef.value) scrollRef.value.scrollTop = 0; };
const onOpenSpecs = (dish: MenuItem) => { openSpecs(dish); specsVisible.value = true; };
const onDirectAdd = (dish: MenuItem) => { cartStore.addItem(dish, 1, '', dish.price); showToast({ message: t('order.addedToCart'), icon: 'success' }); };
const onConfirmSpecs = () => {
  const err = validateRequired();
  if (err) return showToast(err);
  if (currentDish.value) {
    cartStore.addItem(currentDish.value, selectedQuantity.value, getSpecsText(), currentUnitPrice.value);
    specsVisible.value = false;
    showToast({ message: t('order.addedToCart'), icon: 'success' });
  }
};
const onClearCart = () => showConfirmDialog({ title: t('common.dialogTitle'), message: t('cart.clearConfirm') }).then(() => { cartStore.clearCart(); drawerVisible.value = false; });
const onCheckout = () => { if (cartStore.totalCount === 0) return showToast(t('cart.emptyCartTip')); drawerVisible.value = false; router.push('/checkout'); };

onMounted(() => {
  cartStore.setDiningInfo(route.query.diningType === 'TAKEOUT' ? 'TAKEOUT' : 'DINE_IN', (route.query.tableId as string) || 'A1');
  fetchMenu();
});
</script>
