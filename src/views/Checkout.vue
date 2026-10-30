<template>
  <div class="checkout-container">
    <van-nav-bar
      title="確認結帳"
      left-text="返回選餐"
      left-arrow
      @click-left="goBack"
    />

    <div class="checkout-content">
      <!-- Dining Info Card -->
      <div class="info-card">
        <div class="dining-type-row">
          <div class="dining-label">用餐方式</div>
          <van-tag
            :type="cartStore.diningType === 'DINE_IN' ? 'danger' : 'warning'"
            size="large"
            round
          >
            {{ cartStore.diningType === 'DINE_IN' ? `內用桌號：${cartStore.tableCode}` : '外帶自取' }}
          </van-tag>
        </div>
      </div>

      <!-- Order Items Review Card -->
      <div class="items-card">
        <div class="card-head">
          <span class="card-title">餐點明細</span>
          <span class="card-count">共 {{ cartStore.totalCount }} 項</span>
        </div>

        <div class="items-list">
          <div v-for="item in cartStore.items" :key="item.id" class="review-item-row">
            <div class="item-name-block">
              <span class="review-name">{{ item.name }}</span>
              <span v-if="item.optionsText" class="review-specs">{{ item.optionsText }}</span>
            </div>
            <div class="review-qty">x {{ item.quantity }}</div>
            <div class="review-price">NT$ {{ item.price * item.quantity }}</div>
          </div>
        </div>

        <div class="items-total-row">
          <span>小計</span>
          <span class="items-total-num">NT$ {{ cartStore.totalAmount }}</span>
        </div>
      </div>

      <!-- Customer Form Card -->
      <div class="form-card">
        <van-cell-group inset>
          <van-field
            v-model="customerPhone"
            label="聯絡電話"
            placeholder="請輸入手機號碼 (外帶取餐憑證)"
            type="tel"
          />
          <van-field
            v-model="customerNote"
            label="備註需求"
            placeholder="例：不要蔥、醬汁少放"
            type="textarea"
            rows="1"
            autosize
          />
        </van-cell-group>
      </div>

      <!-- Payment Method Selector Card -->
      <div class="payment-card">
        <div class="card-head">
          <span class="card-title">付款方式</span>
          <span class="pay-tip">先結帳後出餐</span>
        </div>

        <van-radio-group v-model="paymentMethod" class="payment-options">
          <van-cell-group inset>
            <van-cell clickable @click="paymentMethod = 'ONLINE'">
              <template #title>
                <div class="pay-cell-title">
                  <span class="pay-icon">💳</span>
                  <div class="pay-info">
                    <span class="pay-name">線上支付 (LINE Pay / 信用卡)</span>
                    <span class="pay-desc">送單後立即完成線上模擬支付，立即送進廚房製作</span>
                  </div>
                </div>
              </template>
              <template #right-icon>
                <van-radio name="ONLINE" />
              </template>
            </van-cell>

            <van-cell clickable @click="paymentMethod = 'CASH'">
              <template #title>
                <div class="pay-cell-title">
                  <span class="pay-icon">💵</span>
                  <div class="pay-info">
                    <span class="pay-name">現場櫃檯支付 (現金 / 實體刷卡)</span>
                    <span class="pay-desc">送單後請至收銀台結帳，店員確認收款後為您製作</span>
                  </div>
                </div>
              </template>
              <template #right-icon>
                <van-radio name="CASH" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </div>

    <!-- Bottom Submit Bar -->
    <div class="submit-bar">
      <div class="submit-left">
        <span class="sub-label">應付金額：</span>
        <span class="sub-price">NT$ {{ cartStore.totalAmount }}</span>
      </div>
      <van-button
        type="primary"
        round
        size="large"
        class="submit-action-btn"
        :loading="submitting"
        color="linear-gradient(to right, #e11d48, #be123c)"
        @click="handleSubmitOrder"
      >
        確認送出訂單
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import api from '../api';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const cartStore = useCartStore();

const customerPhone = ref('');
const customerNote = ref('');
const paymentMethod = ref<'ONLINE' | 'CASH'>('ONLINE');
const submitting = ref(false);

const goBack = () => {
  router.push('/order');
};

const handleSubmitOrder = async () => {
  if (cartStore.items.length === 0) {
    showToast('購物車內沒有餐點');
    router.push('/order');
    return;
  }

  if (cartStore.diningType === 'TAKEOUT' && !customerPhone.value.trim()) {
    showToast('外帶請提供聯絡電話方便取餐');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      diningType: cartStore.diningType,
      tableCode: cartStore.diningType === 'DINE_IN' ? cartStore.tableCode : undefined,
      customerPhone: customerPhone.value.trim(),
      customerNote: customerNote.value.trim(),
      paymentMethod: paymentMethod.value,
      items: cartStore.items.map((it) => ({
        menuItemId: it.menuItemId,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        optionsText: it.optionsText,
      })),
    };

    const res: any = await api.post('/orders', payload);
    if (res.success && res.data) {
      showToast({ message: '訂單建立成功！', icon: 'success' });
      const orderNo = res.data.orderNo;
      cartStore.clearCart();
      router.replace(`/tracking/${orderNo}`);
    }
  } catch (error: any) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.checkout-container {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

.checkout-content {
  flex: 1;
  padding: 12px 14px 90px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.info-card,
.items-card,
.payment-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.dining-type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dining-label {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.card-count,
.pay-tip {
  font-size: 12px;
  color: #64748b;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.item-name-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.review-name {
  font-weight: 600;
  color: #1e293b;
}

.review-specs {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.review-qty {
  font-weight: 700;
  color: #0284c7;
  padding: 0 14px;
}

.review-price {
  font-weight: 700;
  color: #334155;
}

.items-total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.items-total-num {
  font-size: 18px;
  font-weight: 800;
  color: #e11d48;
}

.form-card :deep(.van-cell-group--inset) {
  margin: 0;
}

.payment-options :deep(.van-cell-group--inset) {
  margin: 0;
}

.pay-cell-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pay-icon {
  font-size: 24px;
}

.pay-info {
  display: flex;
  flex-direction: column;
}

.pay-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.pay-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* Submit bar */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.submit-left {
  display: flex;
  align-items: baseline;
}

.sub-label {
  font-size: 13px;
  color: #64748b;
}

.sub-price {
  font-size: 22px;
  font-weight: 800;
  color: #e11d48;
}

.submit-action-btn {
  height: 44px;
  padding: 0 24px;
  font-weight: 700;
}
</style>

