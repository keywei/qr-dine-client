<template>
  <div class="tracking-container">
    <van-nav-bar
      title="訂單進度追蹤"
      right-text="返回點餐"
      @click-right="goToMenu"
    />

    <!-- Loading State -->
    <div v-if="loading && !order" class="loading-state">
      <van-loading type="spinner" color="#0284c7" vertical>載入訂單進度中...</van-loading>
    </div>

    <div v-else-if="order" class="tracking-content">
      <!-- Status Card -->
      <div class="status-card">
        <div class="status-top">
          <div class="status-title-box">
            <span class="status-icon">{{ getStatusEmoji(order.status) }}</span>
            <div class="status-texts">
              <h3 class="status-title">{{ getStatusTitle(order.status, order.paymentStatus) }}</h3>
              <p class="status-desc">{{ getStatusDescription(order.status, order.paymentStatus, order.paymentMethod) }}</p>
            </div>
          </div>

          <van-tag
            :type="order.diningType === 'DINE_IN' ? 'danger' : 'warning'"
            size="medium"
            round
          >
            {{ order.diningType === 'DINE_IN' ? `內用桌號：${order.table?.code || '桌位'}` : '外帶取餐' }}
          </van-tag>
        </div>

        <!-- Progress Steps -->
        <div class="steps-wrapper">
          <van-steps :active="activeStep" active-color="#0284c7">
            <van-step>送出訂單</van-step>
            <van-step>{{ order.paymentStatus === 'PAID' ? '已付款' : '待付款' }}</van-step>
            <van-step>製作中</van-step>
            <van-step>已完成</van-step>
          </van-steps>
        </div>

        <!-- Action: If Online payment is UNPAID, show Mock Pay button -->
        <div v-if="order.paymentStatus === 'UNPAID' && order.paymentMethod === 'ONLINE'" class="pay-action-box">
          <p class="pay-prompt">您選擇線上支付，請點擊下方按鈕完成模擬付款：</p>
          <div class="mock-pay-btns">
            <van-button
              type="primary"
              round
              block
              size="large"
              color="#06c755"
              :loading="paying"
              @click="handleMockPay('LINE_PAY')"
            >
              🟢 LINE Pay 模擬支付 (NT$ {{ order.totalAmount }})
            </van-button>
            <van-button
              type="default"
              round
              block
              size="normal"
              :loading="paying"
              @click="handleMockPay('CREDIT_CARD')"
            >
              💳 信用卡 模擬支付 (NT$ {{ order.totalAmount }})
            </van-button>
          </div>
        </div>

        <!-- Notice: If Cash payment is UNPAID -->
        <div v-else-if="order.paymentStatus === 'UNPAID' && order.paymentMethod === 'CASH'" class="cash-notice-box">
          <van-notice-bar
            left-icon="info-o"
            text="您選擇現場現金支付，請移步至櫃檯告知單號結帳，店員收款後將立即為您安排製作！"
            wrapable
            :scrollable="false"
          />
        </div>

        <!-- Completed message -->
        <div v-else-if="order.status === 'COMPLETED'" class="completed-congrats">
          🎉 餐點已製作完成！祝您用餐愉快！
        </div>
      </div>

      <!-- Order Details Card -->
      <div class="details-card">
        <div class="card-head">
          <span class="card-title">訂單詳情</span>
          <span class="order-no">單號：{{ order.orderNo }}</span>
        </div>

        <div class="detail-items-list">
          <div v-for="item in order.items" :key="item.id" class="detail-item-row">
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.optionsText" class="item-specs">規格：{{ item.optionsText }}</span>
            </div>
            <div class="item-qty">x {{ item.quantity }}</div>
            <div class="item-price">NT$ {{ item.price * item.quantity }}</div>
          </div>
        </div>

        <div v-if="order.customerNote" class="detail-note">
          <span class="note-lbl">備註需求：</span>
          <span>{{ order.customerNote }}</span>
        </div>

        <div class="detail-total-row">
          <span>總計金額</span>
          <span class="detail-total-price">NT$ {{ order.totalAmount }}</span>
        </div>
      </div>

      <!-- Return button -->
      <div class="action-footer">
        <van-button type="default" round block @click="goToMenu">
          回到菜單 / 再次加點
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';
import api from '../api';
import { getClientSocket, joinOrderRoom, leaveOrderRoom } from '../socket';

const route = useRoute();
const router = useRouter();

const order = ref<any>(null);
const loading = ref(false);
const paying = ref(false);

const orderNo = computed(() => String(route.params.orderNo));

const activeStep = computed(() => {
  if (!order.value) return 0;
  if (order.value.status === 'COMPLETED') return 3;
  if (order.value.status === 'COOKING') return 2;
  if (order.value.paymentStatus === 'PAID') return 1;
  return 1;
});

const getStatusEmoji = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return '⏳';
    case 'COOKING':
      return '🍳';
    case 'COMPLETED':
      return '🎉';
    case 'CANCELLED':
      return '❌';
    default:
      return '📋';
  }
};

const getStatusTitle = (status: string, paymentStatus: string) => {
  if (status === 'COMPLETED') return '餐點製作完成！';
  if (status === 'COOKING') return '大廚精心烹調中...';
  if (status === 'CANCELLED') return '訂單已取消';
  if (paymentStatus === 'PAID') return '已確認收款，準備製作';
  return '訂單已送出，等待付款';
};

const getStatusDescription = (status: string, paymentStatus: string, paymentMethod: string) => {
  if (status === 'COMPLETED') {
    return '餐點已準備好，請至取餐櫃檯領取或等候服務人員送上！';
  }
  if (status === 'COOKING') {
    return '廚房已接單並全力準備您的美味餐點，請稍候片刻。';
  }
  if (paymentStatus === 'UNPAID') {
    return paymentMethod === 'ONLINE'
      ? '請點擊下方按鈕完成線上付款，付款成功後將立即製作。'
      : '請至櫃檯現場結帳，店員確認收款後將立即製作。';
  }
  return '感謝您的訂購，我們正為您處理中。';
};

const fetchOrder = async () => {
  loading.value = true;
  try {
    const res: any = await api.get(`/orders/track/${orderNo.value}`);
    if (res.success && res.data) {
      order.value = res.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleMockPay = async (channel: string) => {
  paying.value = true;
  try {
    const res: any = await api.post('/payments/mock-pay', {
      orderNo: orderNo.value,
      paymentChannel: channel,
    });
    if (res.success && res.data) {
      order.value = res.data;
      showToast({ message: '付款成功！訂單已送至廚房', icon: 'success' });
    }
  } catch (error) {
    console.error(error);
  } finally {
    paying.value = false;
  }
};

const goToMenu = () => {
  router.push('/order');
};

onMounted(() => {
  fetchOrder();

  // Join Socket.io room for real-time order updates
  joinOrderRoom(orderNo.value);

  const socket = getClientSocket();
  socket.on('order:updated', (updatedOrder: any) => {
    if (updatedOrder.orderNo === orderNo.value) {
      order.value = updatedOrder;
      showNotify({
        type: 'success',
        message: `訂單狀態更新：${getStatusTitle(updatedOrder.status, updatedOrder.paymentStatus)}`,
      });
    }
  });
});

onUnmounted(() => {
  leaveOrderRoom(orderNo.value);
  const socket = getClientSocket();
  socket.off('order:updated');
});
</script>

<style scoped>
.tracking-container {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
}

.tracking-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-card,
.details-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.status-title-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-icon {
  font-size: 36px;
}

.status-texts .status-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.status-texts .status-desc {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.steps-wrapper {
  margin: 20px 0 10px 0;
}

.pay-action-box {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 14px;
  margin-top: 14px;
}

.pay-prompt {
  font-size: 13px;
  font-weight: 700;
  color: #166534;
  margin: 0 0 10px 0;
}

.mock-pay-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cash-notice-box {
  margin-top: 14px;
}

.completed-congrats {
  margin-top: 14px;
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0369a1;
  text-align: center;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.order-no {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
}

.detail-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item-row {
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

.item-name {
  font-weight: 700;
  color: #1e293b;
}

.item-specs {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.item-qty {
  font-weight: 700;
  color: #0284c7;
  padding: 0 14px;
}

.item-price {
  font-weight: 700;
  color: #334155;
}

.detail-note {
  margin-top: 12px;
  padding: 8px 10px;
  background-color: #fef3c7;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
}

.note-lbl {
  font-weight: 700;
}

.detail-total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
  font-size: 14px;
  font-weight: 700;
}

.detail-total-price {
  font-size: 20px;
  font-weight: 900;
  color: #e11d48;
}

.action-footer {
  margin-top: 10px;
}
</style>

