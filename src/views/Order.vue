<template>
  <div class="order-container">
    <!-- Top Header -->
    <div class="store-header">
      <div class="store-info">
        <h2 class="store-name">🍜 美味食堂</h2>
        <div class="dining-badge">
          <van-tag v-if="cartStore.diningType === 'DINE_IN'" type="danger" size="medium" round>
            內用桌號：{{ cartStore.tableCode || '未指定' }}
          </van-tag>
          <van-tag v-else type="warning" size="medium" round>
            外帶自取模式
          </van-tag>
        </div>
      </div>
      <van-search v-model="searchQuery" placeholder="搜尋想吃的餐點..." shape="round" />
    </div>

    <!-- Main Content: Category Sidebar + Dish List -->
    <div class="menu-layout">
      <!-- Left Sidebar Categories -->
      <van-sidebar v-model="activeCategoryIndex" class="category-sidebar">
        <van-sidebar-item
          v-for="cat in categories"
          :key="cat.id"
          :title="cat.name"
          :badge="getCategoryBadge(cat.id)"
        />
      </van-sidebar>

      <!-- Right Dishes List -->
      <div class="dishes-container" ref="dishesContainerRef">
        <div v-for="cat in filteredCategories" :key="cat.id" class="category-section">
          <div class="section-title">{{ cat.name }}</div>

          <div class="dishes-list">
            <div v-for="dish in cat.items" :key="dish.id" class="dish-card">
              <div class="dish-thumb-box">
                <img :src="dish.imageUrl || defaultDishImg" class="dish-thumb" />
                <div v-if="!dish.isAvailable" class="sold-out-mask">已估清</div>
              </div>

              <div class="dish-details">
                <h4 class="dish-name">{{ dish.name }}</h4>
                <p class="dish-desc">{{ dish.description || '特選食材精心製作' }}</p>
                <div class="dish-bottom">
                  <span class="dish-price">NT$ {{ dish.price }}</span>

                  <div class="dish-action">
                    <template v-if="dish.isAvailable">
                      <!-- If has option groups, open specs popup -->
                      <van-button
                        v-if="dish.options && dish.options.length > 0"
                        size="mini"
                        type="primary"
                        round
                        class="spec-btn"
                        @click="openSpecsPopup(dish)"
                      >
                        選規格
                      </van-button>
                      <!-- Otherwise direct add -->
                      <van-button
                        v-else
                        size="mini"
                        icon="plus"
                        type="primary"
                        round
                        class="plus-btn"
                        @click="directAddToCart(dish)"
                      />
                    </template>
                    <span v-else class="text-disabled">暫停供應</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Specification Customization Popup -->
    <van-popup v-model:show="specsPopupVisible" position="bottom" round class="specs-popup">
      <div v-if="currentDish" class="popup-inner">
        <div class="popup-head">
          <img :src="currentDish.imageUrl || defaultDishImg" class="popup-dish-img" />
          <div class="popup-dish-info">
            <h3>{{ currentDish.name }}</h3>
            <div class="popup-price">NT$ {{ currentDishTotalUnitPrice }}</div>
          </div>
          <van-icon name="cross" class="close-icon" @click="specsPopupVisible = false" />
        </div>

        <div class="popup-specs-scroll">
          <div v-for="grp in currentDish.options" :key="grp.id" class="spec-group">
            <div class="grp-title">
              {{ grp.title }}
              <span v-if="grp.isRequired" class="req-star">*必選</span>
              <span class="grp-type-hint">({{ grp.type === 'SINGLE' ? '單選' : '可複選' }})</span>
            </div>

            <div class="spec-options-grid">
              <div
                v-for="opt in grp.options"
                :key="opt.id"
                class="spec-pill"
                :class="{ active: isOptionSelected(grp.id, opt.name) }"
                @click="toggleOption(grp, opt)"
              >
                <span>{{ opt.name }}</span>
                <span v-if="opt.extraPrice > 0" class="pill-extra">+NT${{ opt.extraPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Popup Footer: Stepper & Add to Cart -->
        <div class="popup-footer">
          <div class="stepper-row">
            <span>購買數量</span>
            <van-stepper v-model="selectedQuantity" min="1" max="99" theme="round" button-size="24" />
          </div>
          <van-button
            type="primary"
            block
            round
            size="large"
            color="linear-gradient(to right, #0284c7, #0369a1)"
            @click="confirmAddWithSpecs"
          >
            加入購物車 (NT$ {{ currentDishTotalUnitPrice * selectedQuantity }})
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- Floating Bottom Cart Bar -->
    <div v-if="cartStore.totalCount > 0" class="floating-cart-bar">
      <div class="cart-left" @click="cartDrawerVisible = true">
        <div class="cart-icon-box">
          <van-icon name="shopping-cart" size="24" color="#fff" />
          <div class="cart-badge-count">{{ cartStore.totalCount }}</div>
        </div>
        <div class="cart-sum">
          <span class="total-text">NT$ {{ cartStore.totalAmount }}</span>
        </div>
      </div>
      <van-button
        type="warning"
        round
        class="checkout-nav-btn"
        @click="goToCheckout"
      >
        去結帳
      </van-button>
    </div>

    <!-- Cart Drawer Popup -->
    <van-popup v-model:show="cartDrawerVisible" position="bottom" round class="cart-drawer">
      <div class="drawer-header">
        <span class="drawer-title">購物車清單 ({{ cartStore.totalCount }}項)</span>
        <van-button size="mini" plain type="danger" @click="handleClearCart">清空購物車</van-button>
      </div>

      <div class="drawer-items-list">
        <div v-for="item in cartStore.items" :key="item.id" class="drawer-item">
          <div class="item-meta">
            <span class="item-title">{{ item.name }}</span>
            <span v-if="item.optionsText" class="item-sub">{{ item.optionsText }}</span>
            <span class="item-unit-price">NT$ {{ item.price }}</span>
          </div>
          <van-stepper
            v-model="item.quantity"
            min="0"
            theme="round"
            button-size="22"
            @change="(val: number) => handleQuantityChange(item.id, val)"
          />
        </div>
      </div>

      <div class="drawer-footer">
        <div class="drawer-total">
          <span>總計金額：</span>
          <span class="drawer-price">NT$ {{ cartStore.totalAmount }}</span>
        </div>
        <van-button
          type="primary"
          block
          round
          size="large"
          color="linear-gradient(to right, #0284c7, #0369a1)"
          @click="goToCheckout"
        >
          確認前往結帳
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import api from '../api';
import { useCartStore } from '../stores/cart';

const defaultDishImg =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const categories = ref<any[]>([]);
const activeCategoryIndex = ref(0);
const searchQuery = ref('');

// Specs Popup state
const specsPopupVisible = ref(false);
const currentDish = ref<any>(null);
const selectedQuantity = ref(1);
const selectedOptionsMap = ref<Record<number, any[]>>({}); // groupId -> array of { name, extraPrice }

// Cart drawer state
const cartDrawerVisible = ref(false);

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((dish: any) => dish.name.toLowerCase().includes(q)),
    }))
    .filter((cat) => cat.items.length > 0);
});

const getCategoryBadge = (catId: number) => {
  const cat = categories.value.find((c) => c.id === catId);
  if (!cat) return undefined;
  const count = cartStore.items
    .filter((it) => cat.items.some((d: any) => d.id === it.menuItemId))
    .reduce((sum, it) => sum + it.quantity, 0);
  return count > 0 ? count : undefined;
};

const fetchMenu = async () => {
  try {
    const res: any = await api.get('/menu');
    if (res.success && res.data) {
      categories.value = res.data;
    }
  } catch (error) {
    console.error(error);
  }
};

// Open Specs dialog
const openSpecsPopup = (dish: any) => {
  currentDish.value = dish;
  selectedQuantity.value = 1;
  selectedOptionsMap.value = {};

  // Auto select first option for single choice groups
  dish.options?.forEach((grp: any) => {
    if (grp.type === 'SINGLE' && grp.options?.length > 0) {
      selectedOptionsMap.value[grp.id] = [grp.options[0]];
    } else {
      selectedOptionsMap.value[grp.id] = [];
    }
  });

  specsPopupVisible.value = true;
};

const isOptionSelected = (groupId: number, optName: string) => {
  const opts = selectedOptionsMap.value[groupId] || [];
  return opts.some((o) => o.name === optName);
};

const toggleOption = (grp: any, opt: any) => {
  if (grp.type === 'SINGLE') {
    selectedOptionsMap.value[grp.id] = [opt];
  } else {
    // Multiple
    const list = selectedOptionsMap.value[grp.id] || [];
    const idx = list.findIndex((o) => o.name === opt.name);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(opt);
    }
    selectedOptionsMap.value[grp.id] = [...list];
  }
};

const currentDishTotalUnitPrice = computed(() => {
  if (!currentDish.value) return 0;
  let price = Number(currentDish.value.price);
  Object.values(selectedOptionsMap.value).forEach((opts) => {
    opts.forEach((o: any) => {
      price += Number(o.extraPrice || 0);
    });
  });
  return price;
});

const confirmAddWithSpecs = () => {
  // Check required groups
  for (const grp of currentDish.value.options || []) {
    if (grp.isRequired) {
      const selected = selectedOptionsMap.value[grp.id] || [];
      if (selected.length === 0) {
        showToast(`請選擇 ${grp.title}`);
        return;
      }
    }
  }

  // Format options text
  const textParts: string[] = [];
  Object.values(selectedOptionsMap.value).forEach((opts) => {
    opts.forEach((o: any) => {
      if (o.extraPrice > 0) {
        textParts.push(`${o.name} (+${o.extraPrice})`);
      } else {
        textParts.push(o.name);
      }
    });
  });

  const specsText = textParts.join(', ');
  cartStore.addItem(currentDish.value, selectedQuantity.value, specsText, currentDishTotalUnitPrice.value);
  specsPopupVisible.value = false;
  showToast({ message: '已加入購物車', icon: 'success' });
};

const directAddToCart = (dish: any) => {
  cartStore.addItem(dish, 1, '', dish.price);
  showToast({ message: '已加入購物車', icon: 'success' });
};

const handleQuantityChange = (cartItemId: string, val: number) => {
  cartStore.updateQuantity(cartItemId, val);
};

const handleClearCart = () => {
  showConfirmDialog({
    title: '提示',
    message: '確定要清空購物車嗎？',
  }).then(() => {
    cartStore.clearCart();
    cartDrawerVisible.value = false;
  });
};

const goToCheckout = () => {
  if (cartStore.totalCount === 0) {
    showToast('購物車內尚無餐點');
    return;
  }
  cartDrawerVisible.value = false;
  router.push('/checkout');
};

onMounted(() => {
  // Check URL query params for tableId & diningType
  const tableId = route.query.tableId as string;
  const diningType = (route.query.diningType as string) || (tableId ? 'DINE_IN' : 'TAKEOUT');

  if (diningType === 'TAKEOUT') {
    cartStore.setDiningInfo('TAKEOUT');
  } else {
    cartStore.setDiningInfo('DINE_IN', tableId || 'A1');
  }

  fetchMenu();
});
</script>

<style scoped>
.order-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  overflow: hidden;
}

.store-header {
  background: #ffffff;
  padding: 12px 16px 4px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.store-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.store-name {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.menu-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-sidebar {
  width: 90px;
  background-color: #f1f5f9;
  overflow-y: auto;
}

.dishes-container {
  flex: 1;
  padding: 10px 12px 80px 12px;
  overflow-y: auto;
}

.category-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 10px;
  padding-left: 4px;
  border-left: 3px solid #0284c7;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.dish-thumb-box {
  width: 78px;
  height: 78px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.dish-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dish-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dish-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.dish-desc {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dish-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.dish-price {
  font-size: 16px;
  font-weight: 800;
  color: #e11d48;
}

.spec-btn {
  padding: 0 10px;
  height: 24px;
}

.plus-btn {
  width: 24px;
  height: 24px;
}

.text-disabled {
  font-size: 12px;
  color: #94a3b8;
}

/* Specs Popup */
.specs-popup {
  max-height: 80%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.popup-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
}

.popup-head {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.popup-dish-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}

.popup-dish-info h3 {
  margin: 0;
  font-size: 16px;
}

.popup-price {
  font-size: 18px;
  font-weight: 800;
  color: #e11d48;
  margin-top: 4px;
}

.close-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
}

.popup-specs-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grp-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.req-star {
  color: #ef4444;
  margin-left: 4px;
  font-size: 12px;
}

.grp-type-hint {
  color: #94a3b8;
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
}

.spec-options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-pill {
  padding: 6px 14px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.spec-pill.active {
  background-color: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
  font-weight: 700;
}

.pill-extra {
  font-size: 11px;
  color: #e11d48;
}

.popup-footer {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.stepper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

/* Floating Bottom Cart Bar */
.floating-cart-bar {
  position: fixed;
  bottom: 14px;
  left: 16px;
  right: 16px;
  height: 54px;
  background: #0f172a;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  z-index: 100;
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.cart-icon-box {
  position: relative;
}

.cart-badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}

.cart-sum .total-text {
  font-size: 19px;
  font-weight: 800;
  color: #ffffff;
}

.checkout-nav-btn {
  font-weight: 700;
  padding: 0 20px;
  height: 38px;
}

/* Cart Drawer */
.cart-drawer {
  padding: 16px;
  max-height: 70vh;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.drawer-title {
  font-size: 16px;
  font-weight: 700;
}

.drawer-items-list {
  max-height: 40vh;
  overflow-y: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-meta {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.item-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.item-unit-price {
  font-size: 13px;
  font-weight: 700;
  color: #e11d48;
  margin-top: 2px;
}

.drawer-footer {
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.drawer-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.drawer-price {
  font-size: 22px;
  font-weight: 800;
  color: #e11d48;
}
</style>

